#!/usr/bin/env python3
"""CPU-friendly Faster-Whisper for Hindi / English / Punjabi mix. Outputs JSON."""
import json
import os
import sys


# Helps code-switching (Hinglish, Punjabi-English) on CPU models
DEFAULT_PROMPT = (
    "Mixed Hindi, English, and Punjabi speech. "
    "Hinglish, Punjabi words, and English phrases in the same sentence."
)


def main():
    if len(sys.argv) < 3:
        print(
            "Usage: transcribe_faster_whisper.py <audio> <out.json> [model] [language]",
            file=sys.stderr,
        )
        sys.exit(1)

    audio_path = sys.argv[1]
    output_path = sys.argv[2]
    model_size = sys.argv[3] if len(sys.argv) > 3 else os.environ.get("WHISPER_MODEL", "base")
    language = sys.argv[4] if len(sys.argv) > 4 else os.environ.get("WHISPER_LANGUAGE", "auto")
    if language in ("auto", "", "null", "None"):
        language = None

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

    print(json.dumps({"ok": True, "segments": len(segments), "language": info.language}))


if __name__ == "__main__":
    main()
