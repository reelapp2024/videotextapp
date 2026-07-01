# Auto captions (CPU · Hindi / English / Punjabi)

## Install (one time)

**Windows:** Install [Python 3](https://www.python.org/downloads/) — check **“Add python.exe to PATH”** during setup.

```bash
cd Reel-Maker-Backend
pip install -r requirements-whisper.txt
```

If `python` is not found, use the Python launcher or set `PYTHON_PATH` in `.env`:

```env
PYTHON_PATH=py
```

(or full path, e.g. `C:\Users\You\AppData\Local\Programs\Python\Python312\python.exe`)

## Backend env (optional)

```env
PYTHON_PATH=python
WHISPER_MODEL=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
WHISPER_CPU_THREADS=4
CAPTION_CPU_PARALLEL=1
WHISPER_LANGUAGE=auto
```

- **base + int8** — best balance on CPU for Hindi/English/Punjabi mix.
- **tiny** — faster, less accurate for Punjabi.
- First uploaded voice is transcribed first so the editor opens sooner.

## Use in app

1. Upload voices (Upload tab) → **Auto captions** or open **Captions** tab.
2. Wait for first track → edit text → **Use synced captions in main bulk export**.
3. Text tab: enable voice sync if needed; run **Start** for image+voice or video+voice bulk.

Restart backend after install: `npm start` in `Reel-Maker-Backend`.
