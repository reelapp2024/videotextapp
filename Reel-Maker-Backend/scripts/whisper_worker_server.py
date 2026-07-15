#!/usr/bin/env python3
"""
Persistent Faster-Whisper worker — loads model once, serves JSON-line requests on stdin.
Detects language (HI/PA/EN bias), then force-transcribes in that language.
"""
import json
import os
import sys
import traceback

# Ensure sibling imports work when spawned from Node.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from whisper_indic_transcribe import normalize_language, transcribe_accurate  # noqa: E402


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def load_model(model_size):
    from faster_whisper import WhisperModel

    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE", "int8")
    cpu_threads = int(os.environ.get("WHISPER_CPU_THREADS", str(os.cpu_count() or 4)))

    log(f"[whisper-worker] loading model={model_size} device={device} compute={compute_type} threads={cpu_threads}")
    common = dict(
        device=device,
        compute_type=compute_type,
        cpu_threads=cpu_threads,
    )
    # Prefer local cache so caption jobs never hang on Hugging Face mid-request.
    try:
        model = WhisperModel(model_size, local_files_only=True, **common)
        log(f"[whisper-worker] model ready (local cache): {model_size}")
        return model
    except Exception as cache_err:
        log(f"[whisper-worker] local cache miss for {model_size}: {cache_err}")
        log("[whisper-worker] downloading model once from Hugging Face… (can take several minutes)")
        model = WhisperModel(model_size, **common)
        log(f"[whisper-worker] model ready (downloaded): {model_size}")
        return model


def transcribe(model, audio_path, output_path, language, model_size):
    language = normalize_language(language)
    result = transcribe_accurate(model, audio_path, language)

    payload = {
        "language": result["language"],
        "languageProbability": result.get("languageProbability"),
        "requestedLanguage": result.get("requestedLanguage"),
        "detectMeta": result.get("detectMeta"),
        "duration": result.get("duration"),
        "segments": result["segments"],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    log(
        f"[whisper-worker] done lang={payload['language']} "
        f"p={payload.get('languageProbability')} segs={len(payload['segments'])} "
        f"req={payload.get('requestedLanguage')}"
        + (" EMPTY — will retry/repair in next pass if needed" if not payload["segments"] else "")
    )

    return {
        "ok": True,
        "segments": len(payload["segments"]),
        "language": payload["language"],
        "languageProbability": payload.get("languageProbability"),
        "empty": len(payload["segments"]) == 0,
    }


def respond(payload):
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def main():
    default_model = os.environ.get("WHISPER_MODEL", "small")
    models = {}

    try:
        from faster_whisper import WhisperModel  # noqa: F401
    except ImportError:
        respond({"ok": False, "error": "Install: pip install faster-whisper"})
        sys.exit(2)

    # Warm the default model BEFORE marking ready so first caption click is not stuck downloading.
    try:
        models[default_model] = load_model(default_model)
    except Exception as e:
        log(f"[whisper-worker] failed to warm {default_model}: {e}")
        # Fallback to already-cached base so production captions keep working.
        fallback = "base"
        if default_model != fallback:
            log(f"[whisper-worker] falling back to cached model={fallback}")
            try:
                models[fallback] = load_model(fallback)
                default_model = fallback
            except Exception as e2:
                respond({"ok": False, "error": f"Could not load Whisper model: {e2}"})
                sys.exit(3)

    respond({"ok": True, "ready": True, "defaultModel": default_model, "warmed": list(models.keys())})
    log(f"[whisper-worker] waiting for requests (warmed={list(models.keys())})")

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

            # If client asks for an uncached larger model, prefer warmed default instead of hanging.
            if model_size not in models:
                try:
                    models[model_size] = load_model(model_size)
                except Exception as load_err:
                    log(f"[whisper-worker] cannot load {model_size}: {load_err} — using {default_model}")
                    model_size = default_model

            result = transcribe(models[model_size], audio_path, output_path, language, model_size)
            respond({"id": req_id, **result})
        except Exception as e:
            log(f"[whisper-worker] error: {e}")
            log(traceback.format_exc())
            respond({"id": req_id, "ok": False, "error": str(e)})


if __name__ == "__main__":
    main()
