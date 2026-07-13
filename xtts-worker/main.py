"""
Advanced TTS FastAPI worker — self-hosted Piper (no Microsoft Azure / Edge).

Run:
  cd xtts-worker
  .venv\\Scripts\\activate
  uvicorn main:app --host 127.0.0.1 --port 8020

Backend .env:
  XTTS_FASTAPI_URL=http://127.0.0.1:8020
  ADVANCED_TTS_ENABLED=true
"""

from __future__ import annotations

import asyncio
import io
import os
import struct
import tempfile
import threading
import wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.request import urlretrieve

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(title="Reel Maker Advanced TTS Worker", version="3.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VOICES_DIR = Path(__file__).resolve().parent / "voices"
VOICES_DIR.mkdir(parents=True, exist_ok=True)

PIPER_POOL_SIZE = max(1, min(8, int(os.getenv("PIPER_POOL_SIZE", "3") or 3)))
_executor = ThreadPoolExecutor(max_workers=PIPER_POOL_SIZE)

# HuggingFace rhasspy/piper-voices relative paths (or full https:// for custom voices)
PIPER_CATALOG: Dict[str, str] = {
    "en_US-lessac-medium": "en/en_US/lessac/medium",
    "en_US-amy-medium": "en/en_US/amy/medium",
    "en_US-kristin-medium": "en/en_US/kristin/medium",
    "en_US-ljspeech-high": "en/en_US/ljspeech/high",
    "en_US-hfc_female-medium": "en/en_US/hfc_female/medium",
    "en_US-ryan-high": "en/en_US/ryan/high",
    "en_US-joe-medium": "en/en_US/joe/medium",
    "en_US-danny-low": "en/en_US/danny/low",
    "en_US-hfc_male-medium": "en/en_US/hfc_male/medium",
    "en_GB-alba-medium": "en/en_GB/alba/medium",
    "en_GB-alan-medium": "en/en_GB/alan/medium",
    "en_GB-northern_english_male-medium": "en/en_GB/northern_english_male/medium",
    "en_GB-semaine-medium": "en/en_GB/semaine/medium",
    "en_GB-cori-high": "en/en_GB/cori/high",
    # Real Indian English neural (SPICOR / Navgurukul) — not Hindi, not US FX
    "en_IN-spicor-medium": (
        "https://huggingface.co/navgurukul-ai-labs/text-to-speech-en-IN-piper/resolve/main/"
        "en_IN-dataset=spicor-english-base=ljspeech-epochs=1089"
    ),
    "hi_IN-priyamvada-medium": "hi/hi_IN/priyamvada/medium",
    "hi_IN-pratham-medium": "hi/hi_IN/pratham/medium",
    "hi_IN-rohan-medium": "hi/hi_IN/rohan/medium",
}

# Map UI accent → preferred espeak voice for English models
ACCENT_ESPEAK = {
    "Neutral": "en-us",
    "American (Gen)": "en-us",
    "American (Valley)": "en-US-nyc",
    "American (South)": "en-us",
    "British (RP)": "en-gb-x-rp",
    "British (Brixton)": "en-GB-scotland",
    "Transatlantic": "en-us",
    "Australian": "en-029",
    # en_IN-spicor was trained with en-us phonemes; keep matching espeak
    "Indian English": "en-us",
    "Custom": "en-us",
}

_voice_cache: Dict[str, Any] = {}
_voice_pools: Dict[str, List[Any]] = {}
_pool_locks: Dict[str, threading.Lock] = {}
_device = "cpu"


def _pool_lock(voice_id: str) -> threading.Lock:
    if voice_id not in _pool_locks:
        _pool_locks[voice_id] = threading.Lock()
    return _pool_locks[voice_id]


def _detect_device() -> str:
    global _device
    try:
        import torch

        if torch.cuda.is_available():
            _device = "cuda"
            return _device
    except Exception:
        pass
    _device = "cpu"
    return _device


def ensure_voice_files(voice_id: str) -> Path:
    voice_id = (voice_id or "en_US-lessac-medium").strip()
    if voice_id not in PIPER_CATALOG:
        # allow unknown id if files already present
        onnx = VOICES_DIR / f"{voice_id}.onnx"
        if onnx.exists():
            return onnx
        voice_id = "en_US-lessac-medium"

    onnx = VOICES_DIR / f"{voice_id}.onnx"
    conf = VOICES_DIR / f"{voice_id}.onnx.json"
    if (
        onnx.exists()
        and conf.exists()
        and onnx.stat().st_size > 1_000_000
        and conf.stat().st_size > 100
    ):
        return onnx
    # Remove incomplete / corrupt ONNX only (JSON is small by design)
    try:
        if onnx.exists() and onnx.stat().st_size < 1_000_000:
            onnx.unlink()
    except OSError:
        pass
    try:
        if conf.exists() and conf.stat().st_size < 50:
            conf.unlink()
    except OSError:
        pass

    rel = PIPER_CATALOG[voice_id]
    if rel.startswith("http://") or rel.startswith("https://"):
        # Custom HF model: catalog value is URL prefix without .onnx / .onnx.json
        url_onnx = f"{rel}.onnx"
        url_json = f"{rel}.onnx.json"
    else:
        base = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
        url_onnx = f"{base}/{rel}/{voice_id}.onnx"
        url_json = f"{base}/{rel}/{voice_id}.onnx.json"
    print(f"[piper] downloading {voice_id}…")
    try:
        urlretrieve(url_onnx, onnx)
        urlretrieve(url_json, conf)
    except Exception as e:
        for p in (onnx, conf):
            try:
                if p.exists():
                    p.unlink()
            except OSError:
                pass
        raise RuntimeError(f"Failed to download Piper voice {voice_id}: {e}") from e
    return onnx


def _create_piper_voice(voice_id: str):
    from piper import PiperVoice

    model_path = ensure_voice_files(voice_id)
    use_cuda = _detect_device() == "cuda"
    voice = PiperVoice.load(model_path, use_cuda=use_cuda)
    try:
        voice._piper_id = voice_id  # type: ignore[attr-defined]
    except Exception:
        pass
    return voice


def load_piper_voice(voice_id: str):
    """Legacy single-cache load (warmup / health). Prefer borrow_voice for synth."""
    key = voice_id or "en_US-lessac-medium"
    if key in _voice_cache:
        return _voice_cache[key]
    voice = _create_piper_voice(key)
    _voice_cache[key] = voice
    return voice


def borrow_voice(voice_id: str):
    key = voice_id or "en_US-lessac-medium"
    lock = _pool_lock(key)
    with lock:
        pool = _voice_pools.setdefault(key, [])
        if pool:
            return pool.pop()
    return _create_piper_voice(key)


def release_voice(voice_id: str, voice) -> None:
    key = voice_id or "en_US-lessac-medium"
    lock = _pool_lock(key)
    with lock:
        pool = _voice_pools.setdefault(key, [])
        if len(pool) < PIPER_POOL_SIZE:
            pool.append(voice)


def _apply_espeak_voice(voice, espeak_voice: Optional[str]):
    """Override phoneme dialect when the model supports ESPEAK phonemes."""
    if not espeak_voice:
        return
    try:
        # Don't force Hindi phonemes onto English acoustic models (garbled).
        # Hindi espeak only with hi_IN models; English accents on en_* models.
        vid = getattr(voice, "_piper_id", "") or ""
        is_hi_model = str(vid).startswith("hi_")
        if espeak_voice == "hi" and not is_hi_model:
            return
        if is_hi_model:
            voice.config.espeak_voice = "hi"
            return
        voice.config.espeak_voice = espeak_voice
    except Exception as e:
        print(f"[piper] espeak override skipped: {e}")


def synthesize_piper(
    text: str,
    voice_id: str,
    speed: float = 1.0,
    volume: float = 1.0,
    length_scale: Optional[float] = None,
    noise_scale: Optional[float] = None,
    noise_w_scale: Optional[float] = None,
    speaker_id: Optional[int] = None,
    espeak_voice: Optional[str] = None,
) -> bytes:
    from piper import SynthesisConfig

    vid = voice_id or "en_US-lessac-medium"
    voice = borrow_voice(vid)
    try:
        _apply_espeak_voice(voice, espeak_voice)

        spd = max(0.5, min(2.0, float(speed or 1.0)))
        # Piper length_scale: higher = slower. Character bias × inverted speed.
        base_ls = float(length_scale) if length_scale is not None else 1.0
        ls = max(0.5, min(2.0, base_ls / spd))
        cfg = SynthesisConfig(
            speaker_id=speaker_id,
            length_scale=ls,
            noise_scale=noise_scale if noise_scale is not None else 0.667,
            noise_w_scale=noise_w_scale if noise_w_scale is not None else 0.8,
            normalize_audio=True,
            volume=max(0.2, min(2.0, float(volume or 1.0))),
        )

        sample_rate = int(getattr(voice.config, "sample_rate", 22050) or 22050)
        pcm = bytearray()
        for chunk in voice.synthesize(text, syn_config=cfg):
            audio = getattr(chunk, "audio_int16_bytes", None)
            if audio is None:
                arr = getattr(chunk, "audio_int16_array", None)
                if arr is not None:
                    audio = arr.tobytes()
            if audio:
                pcm.extend(audio)

        if not pcm:
            raise RuntimeError("Piper returned empty audio")

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(bytes(pcm))
        return buf.getvalue()
    finally:
        release_voice(vid, voice)


class SynthBody(BaseModel):
    text: str
    language: str = "en"
    speed: float = 1.0
    pitch: float = 1.0
    volume: float = 1.0
    emotion: str = "vocal_smile"
    voice: str = "en_US-lessac-medium"
    temperature: float = 0.75
    stability: float = 0.72
    length_scale: Optional[float] = None
    noise_scale: Optional[float] = None
    noise_w_scale: Optional[float] = None
    speaker_id: Optional[int] = None
    accent: Optional[str] = None
    espeak_voice: Optional[str] = None


@app.get("/health")
def health():
    device = _detect_device()
    ready = []
    for vid in PIPER_CATALOG:
        onnx = VOICES_DIR / f"{vid}.onnx"
        if onnx.exists() and onnx.stat().st_size > 1000:
            ready.append(vid)
    return {
        "ok": True,
        "service": "advanced-tts-pro",
        "engine": "piper-local",
        "device": device,
        "cuda": device == "cuda",
        "xtts_loaded": False,
        "piper": True,
        "piper_voices_ready": len(ready),
        "piper_voices_total": len(PIPER_CATALOG),
        "piper_pool_size": PIPER_POOL_SIZE,
        "azure": False,
        "edge_tts": False,
        "online": True,
        "pro_features": [
            "piper_local",
            "accent_voice_rematch",
            "emotion_fx_via_node",
            "pace_accent_via_node",
            "clone_match_via_node",
        ],
        "message": f"Self-hosted Piper online - {len(ready)}/{len(PIPER_CATALOG)} voices cached",
    }


@app.get("/voices")
def list_voices():
    out = []
    for vid, rel in PIPER_CATALOG.items():
        onnx = VOICES_DIR / f"{vid}.onnx"
        out.append(
            {
                "id": vid,
                "path": rel,
                "ready": onnx.exists() and onnx.stat().st_size > 1000,
            }
        )
    return {"voices": out, "engine": "piper-local"}


@app.post("/synthesize_json")
async def synthesize_json(body: SynthBody):
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(400, "text required")
    try:
        noise = body.noise_scale
        if noise is None:
            noise = 0.4 + float(body.temperature or 0.75) * 0.4
        noise_w = body.noise_w_scale
        if noise_w is None:
            noise_w = 0.5 + (1.0 - float(body.stability or 0.72)) * 0.5

        espeak = body.espeak_voice or ACCENT_ESPEAK.get(body.accent or "", None)
        voice_id = body.voice or "en_US-lessac-medium"

        loop = asyncio.get_running_loop()
        data = await loop.run_in_executor(
            _executor,
            lambda: synthesize_piper(
                text=text,
                voice_id=voice_id,
                speed=body.speed,
                volume=body.volume,
                length_scale=body.length_scale,
                noise_scale=noise,
                noise_w_scale=noise_w,
                speaker_id=body.speaker_id,
                espeak_voice=espeak,
            ),
        )
        return Response(content=data, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(500, f"piper synthesize failed: {e}") from e


@app.post("/synthesize")
async def synthesize(
    text: Optional[str] = Form(None),
    language: str = Form("en"),
    speed: float = Form(1.0),
    pitch: float = Form(1.0),
    volume: float = Form(1.0),
    voice: str = Form("en_US-lessac-medium"),
    length_scale: Optional[float] = Form(None),
    noise_scale: Optional[float] = Form(None),
    accent: Optional[str] = Form(None),
    espeak_voice: Optional[str] = Form(None),
    speaker_wav: Optional[UploadFile] = File(None),
):
    _ = (language, pitch, speaker_wav)
    body = SynthBody(
        text=text or "",
        speed=speed,
        volume=volume,
        voice=voice,
        length_scale=length_scale,
        noise_scale=noise_scale,
        accent=accent,
        espeak_voice=espeak_voice,
    )
    return await synthesize_json(body)


@app.on_event("startup")
def _warmup():
    _detect_device()
    print(f"[piper] pool size={PIPER_POOL_SIZE} workers={PIPER_POOL_SIZE}")
    for vid in (
        "en_IN-spicor-medium",
        "en_US-lessac-medium",
        "en_US-ryan-high",
        "en_US-amy-medium",
        "en_US-danny-low",
        "en_US-kristin-medium",
        "en_GB-alba-medium",
    ):
        try:
            ensure_voice_files(vid)
            # Pre-load pool instances for hot voices (esp. Indian English)
            n = PIPER_POOL_SIZE if vid == "en_IN-spicor-medium" else 1
            for _ in range(n):
                release_voice(vid, _create_piper_voice(vid))
            print(f"[piper] warmed {vid} x{n}")
        except Exception as e:
            print(f"[piper] warmup skip {vid}: {e}")
