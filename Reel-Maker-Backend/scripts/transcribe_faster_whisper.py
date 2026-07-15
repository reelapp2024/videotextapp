#!/usr/bin/env python3
"""One-shot Faster-Whisper for Hindi / Punjabi / English captions. Outputs JSON."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from whisper_indic_transcribe import normalize_language, transcribe_accurate  # noqa: E402


def main():
    if len(sys.argv) < 3:
        print(
            "Usage: transcribe_faster_whisper.py <audio> <out.json> [model] [language]",
            file=sys.stderr,
        )
        sys.exit(1)

    audio_path = sys.argv[1]
    output_path = sys.argv[2]
    model_size = sys.argv[3] if len(sys.argv) > 3 else os.environ.get("WHISPER_MODEL", "small")
    language = normalize_language(
        sys.argv[4] if len(sys.argv) > 4 else os.environ.get("WHISPER_LANGUAGE", "auto")
    )

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("Install: pip install faster-whisper", file=sys.stderr)
        sys.exit(2)

    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE", "int8")
    cpu_threads = int(os.environ.get("WHISPER_CPU_THREADS", str(os.cpu_count() or 4)))

    model = WhisperModel(
        model_size,
        device=device,
        compute_type=compute_type,
        cpu_threads=cpu_threads,
    )

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

    print(
        json.dumps(
            {
                "ok": True,
                "segments": len(payload["segments"]),
                "language": payload["language"],
                "languageProbability": payload.get("languageProbability"),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
