#!/usr/bin/env python3
"""Fast Hindi / Punjabi / English Whisper helpers — no prompt-echo, single-pass where possible."""
from __future__ import annotations

import os
import re
from typing import List, Optional, Tuple

# Style seeds only (NOT instructions). Long instructional prompts get echoed into captions.
# English: never use a prompt — Whisper English is strong and prompts often leak as text.
STYLE_SEEDS = {
    "hi": "नमस्ते, क्या हाल है।",
    "pa": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕੀ ਹਾਲ ਹੈ।",
    "ur": "السلام علیکم۔",
    "bn": "নমস্কার।",
    "ta": "வணக்கம்.",
    "te": "నమస్కారం.",
    "mr": "नमस्कार.",
    "gu": "નમસ્તે.",
}

INDIC_BIAS = ("pa", "hi", "ur", "bn", "ta", "te", "mr", "gu", "en")

# Catch prompt / instruction leakage if model still echoes something.
ECHO_PATTERNS = [
    re.compile(r"this is clear english", re.I),
    re.compile(r"transcribe accurately", re.I),
    re.compile(r"conversational speech", re.I),
    re.compile(r"spoken in english", re.I),
    re.compile(r"पूरी तरह हिंदी में बोला", re.I),
    re.compile(r"देवनागरी लिपि", re.I),
    re.compile(r"ਪੂਰੀ ਤਰ੍ਹਾਂ ਪੰਜਾਬੀ", re.I),
    re.compile(r"ਗੁਰਮੁਖੀ ਲਿਪੀ", re.I),
]


def normalize_language(language: Optional[str]) -> Optional[str]:
    if language is None:
        return None
    lang = str(language).strip().lower()
    if lang in ("auto", "", "null", "none"):
        return None
    aliases = {
        "hindi": "hi",
        "punjabi": "pa",
        "panjabi": "pa",
        "english": "en",
        "urdu": "ur",
        "hinglish": "hi",
        "pa-in": "pa",
        "hi-in": "hi",
        "en-in": "en",
        "en-us": "en",
    }
    return aliases.get(lang, lang)


def get_prompt_for_language(language: Optional[str]) -> Optional[str]:
    """Short native-script seed for Indic only. Never for English."""
    env_prompt = os.environ.get("WHISPER_PROMPT")
    if env_prompt:
        return env_prompt
    lang = normalize_language(language)
    if not lang or lang == "en":
        return None
    return STYLE_SEEDS.get(lang)


def _prob_map(all_language_probs: Optional[List[Tuple[str, float]]]) -> dict:
    out = {}
    for item in all_language_probs or []:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            out[str(item[0])] = float(item[1])
    return out


def bias_language_choice(
    detected: str,
    probability: float,
    all_language_probs: Optional[List[Tuple[str, float]]] = None,
) -> Tuple[str, float, str]:
    detected = normalize_language(detected) or "en"
    probs = _prob_map(all_language_probs)
    if not probs:
        probs = {detected: float(probability or 0)}

    pa = probs.get("pa", 0.0)
    hi = probs.get("hi", 0.0)
    ur = probs.get("ur", 0.0)
    confidence = float(probability or 0)
    threshold = float(os.environ.get("WHISPER_LANG_CONFIDENCE", "0.5") or 0.5)

    if detected == "ur" and hi >= max(0.18, ur - 0.08):
        return "hi", hi, "biased_hi_over_ur"
    if detected == "hi" and pa >= 0.22 and pa >= (hi * 0.82) and (hi - pa) <= 0.12:
        return "pa", pa, "biased_pa_near_hi"
    if detected in INDIC_BIAS and confidence >= threshold:
        return detected, confidence, "confident"

    ranked = sorted(
        ((lang, probs.get(lang, 0.0)) for lang in INDIC_BIAS),
        key=lambda x: x[1],
        reverse=True,
    )
    best_lang, best_p = ranked[0] if ranked else (detected, confidence)
    if best_p >= 0.2:
        return best_lang, best_p, "indic_rerank"
    return detected, confidence, "fallback_detected"


def detect_speech_language(model, audio_path: str) -> Tuple[str, float, list]:
    """Fast 1-chunk language detect (no long multi-segment pass)."""
    from faster_whisper.audio import decode_audio

    segments = int(os.environ.get("WHISPER_LANG_DETECT_SEGMENTS", "1") or 1)
    threshold = float(os.environ.get("WHISPER_LANG_DETECT_THRESHOLD", "0.4") or 0.4)
    audio = decode_audio(audio_path, sampling_rate=16000)
    # ~30s window is enough for language ID and much faster than 90s.
    max_samples = int(16000 * 30)
    if getattr(audio, "shape", None) is not None and audio.shape[0] > max_samples:
        audio = audio[:max_samples]

    lang, prob, all_probs = model.detect_language(
        audio=audio,
        vad_filter=True,
        language_detection_segments=max(1, min(segments, 2)),
        language_detection_threshold=threshold,
    )
    chosen, conf, reason = bias_language_choice(lang, prob, all_probs)
    top = sorted(_prob_map(all_probs).items(), key=lambda x: x[1], reverse=True)[:5]
    return chosen, conf, [{"raw": lang, "rawProb": prob, "reason": reason, "top": top}]


def beam_for_language(language: Optional[str]) -> Tuple[int, int]:
    # Fast defaults — CPU captions must stay snappy.
    base_beam = int(os.environ.get("WHISPER_BEAM_SIZE", "2") or 2)
    base_best = int(os.environ.get("WHISPER_BEST_OF", "1") or 1)
    lang = normalize_language(language)
    if lang in ("hi", "pa", "ur"):
        beam = max(base_beam, 2)
        return beam, max(1, min(base_best, beam))
    # English: beam=1 is fast and accurate enough.
    return 1, 1


def is_prompt_echo(text: str) -> bool:
    t = (text or "").strip()
    if not t:
        return True
    if any(p.search(t) for p in ECHO_PATTERNS):
        return True
    # Exact style-seed echo
    for seed in STYLE_SEEDS.values():
        if t == seed or t.rstrip("।.") == seed.rstrip("।."):
            return True
    return False


def scrub_segments(segments: list) -> list:
    cleaned = []
    for seg in segments:
        text = (seg.get("text") or "").strip()
        if is_prompt_echo(text):
            continue
        words = [
            w for w in (seg.get("words") or [])
            if w.get("word") and not is_prompt_echo(w.get("word", ""))
        ]
        cleaned.append({**seg, "text": text, "words": words})
    return cleaned


def run_transcribe(model, audio_path, language, prompt, beam_size, best_of, temperature, *, vad_filter, no_speech_threshold):
    kwargs = dict(
        language=language,
        task="transcribe",
        word_timestamps=True,
        vad_filter=vad_filter,
        beam_size=beam_size,
        best_of=best_of,
        temperature=temperature,
        condition_on_previous_text=False,
        compression_ratio_threshold=2.4,
        log_prob_threshold=-1.0,
        no_speech_threshold=no_speech_threshold,
    )
    if vad_filter:
        kwargs["vad_parameters"] = dict(
            min_silence_duration_ms=350,
            speech_pad_ms=400,
            threshold=0.35,
        )
    if prompt and language != "en":
        kwargs["initial_prompt"] = prompt

    segments_iter, info = model.transcribe(audio_path, **kwargs)
    segments = []
    for seg in segments_iter:
        words = []
        if seg.words:
            for w in seg.words:
                word = (w.word or "").strip()
                if not word:
                    continue
                words.append({
                    "start": round(float(w.start), 3),
                    "end": round(float(w.end), 3),
                    "word": word,
                })
        text = (seg.text or "").strip()
        if not text:
            continue
        segments.append({
            "start": round(float(seg.start), 3),
            "end": round(float(seg.end), 3),
            "text": text,
            "words": words,
        })
    return segments, info


def transcribe_accurate(model, audio_path: str, language: Optional[str]):
    """
    Fast path:
    - User picked language → single force-transcribe (no separate detect)
    - Auto → quick 1-chunk detect, then one force-transcribe
    English never uses initial_prompt (prevents caption pollution).
    Empty result retries once with VAD off (fixes quiet / edge-case audio).
    """
    requested = normalize_language(language)
    detect_meta = None
    detect_prob = 1.0

    if requested is None:
        try:
            chosen, conf, detect_meta = detect_speech_language(model, audio_path)
            language = chosen
            detect_prob = conf
        except Exception as detect_err:
            # Detection failure should not kill captions — fall through to Whisper auto.
            language = None
            detect_prob = 0.0
            detect_meta = [{"error": str(detect_err), "reason": "detect_failed"}]

    prompt = get_prompt_for_language(language)
    beam_size, best_of = beam_for_language(language or "en")

    temperature = 0.0
    try:
        temps_env = os.environ.get("WHISPER_TEMPERATURES", "0.0")
        temperature = float(temps_env.split(",")[0].strip() or "0.0")
    except ValueError:
        temperature = 0.0

    # Pass 1: normal VAD (faster, better on clean speech)
    segments, info = run_transcribe(
        model,
        audio_path,
        language,
        prompt,
        beam_size,
        best_of,
        temperature,
        vad_filter=True,
        no_speech_threshold=0.45,
    )
    segments = scrub_segments(segments)

    # Pass 2: if VAD wiped quiet/noisy speech, retry without VAD
    if not segments:
        segments, info = run_transcribe(
            model,
            audio_path,
            language,
            prompt,
            max(beam_size, 2),
            max(best_of, 2),
            temperature,
            vad_filter=False,
            no_speech_threshold=0.2,
        )
        segments = scrub_segments(segments)

    # Pass 3: still empty and language was forced — try pure auto (no forced lang)
    if not segments and language is not None:
        segments, info = run_transcribe(
            model,
            audio_path,
            None,
            None,
            2,
            2,
            0.0,
            vad_filter=False,
            no_speech_threshold=0.2,
        )
        segments = scrub_segments(segments)

    resolved_lang = normalize_language(getattr(info, "language", None)) or language or "en"

    return {
        "language": resolved_lang,
        "languageProbability": round(
            float(getattr(info, "language_probability", detect_prob) or detect_prob or 0),
            4,
        ),
        "requestedLanguage": requested or "auto",
        "detectMeta": detect_meta,
        "duration": round(float(info.duration), 3) if getattr(info, "duration", None) else None,
        "segments": segments,
        "beamSize": beam_size,
        "promptUsed": bool(prompt and language != "en"),
        "empty": len(segments) == 0,
    }
