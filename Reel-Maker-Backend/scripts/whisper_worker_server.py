#!/usr/bin/env python3
"""
Persistent Faster-Whisper worker — loads the model once, then serves JSON-line requests on stdin.
Stdout: one JSON response per line. Logs go to stderr.
"""
import json
import os
import sys
import traceback

DEFAULT_PROMPT = (
    "Mixed Hindi, English, and Punjabi speech. "
    "Hinglish, Punjabi words, and English phrases in the same sentence."
)


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def load_model(model_size):
    from faster_whisper import WhisperModel

    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE", "int8")
    cpu_threads = int(os.environ.get("WHISPER_CPU_THREADS", str(os.cpu_count() or 4)))

    log(f"[whisper-worker] loading model={model_size} device={device} compute={compute_type} threads={cpu_threads}")
    model = WhisperModel(
        model_size,
        device=device,
        compute_type=compute_type,
        cpu_threads=cpu_threads,
    )
    log("[whisper-worker] model ready")
    return model


def transcribe(model, audio_path, output_path, language, model_size):
    if language in ("auto", "", "null", "None"):
        language = None

    beam_size = int(os.environ.get("WHISPER_BEAM_SIZE", "5"))
    best_of = int(os.environ.get("WHISPER_BEST_OF", str(beam_size)))

    segments_iter, info = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,
        vad_filter=True,
        beam_size=beam_size,
        best_of=best_of,
        temperature=0.0,
        initial_prompt=os.environ.get("WHISPER_PROMPT", DEFAULT_PROMPT),
        condition_on_previous_text=True,
    )

    segments = []
    for seg in segments_iter:
        words = []
        if seg.words:
            for w in seg.words:
                words.append({
                    "start": round(float(w.start), 3),
                    "end": round(float(w.end), 3),
                    "word": (w.word or "").strip(),
                })
        segments.append({
            "start": round(float(seg.start), 3),
            "end": round(float(seg.end), 3),
            "text": (seg.text or "").strip(),
            "words": words,
        })

    payload = {
        "language": info.language,
        "duration": round(float(info.duration), 3) if info.duration else None,
        "segments": segments,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return {
        "ok": True,
        "segments": len(segments),
        "language": info.language,
    }


def respond(payload):
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def main():
    default_model = os.environ.get("WHISPER_MODEL", "base")
    models = {}

    try:
        from faster_whisper import WhisperModel  # noqa: F401
    except ImportError:
        respond({"ok": False, "error": "Install: pip install faster-whisper"})
        sys.exit(2)

    respond({"ok": True, "ready": True, "defaultModel": default_model})
    log("[whisper-worker] waiting for requests")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        req_id = None
        try:
            req = json.loads(line)
            req_id = req.get("id")
            audio_path = req.get("audio")
            output_path = req.get("out")
            model_size = req.get("model") or default_model
            language = req.get("language") or os.environ.get("WHISPER_LANGUAGE", "auto")

            if not audio_path or not output_path:
                raise ValueError("audio and out paths required")

            if not os.path.isfile(audio_path):
                raise FileNotFoundError(f"Audio not found: {audio_path}")

            if model_size not in models:
                models[model_size] = load_model(model_size)

            result = transcribe(models[model_size], audio_path, output_path, language, model_size)
            respond({"id": req_id, **result})
        except Exception as e:
            log(f"[whisper-worker] error: {e}")
            log(traceback.format_exc())
            respond({"id": req_id, "ok": False, "error": str(e)})


if __name__ == "__main__":
    main()
