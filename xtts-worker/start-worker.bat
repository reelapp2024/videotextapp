@echo off
cd /d "%~dp0"
if not exist .venv\Scripts\uvicorn.exe (
  echo Creating venv and installing deps...
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
)
echo Starting self-hosted Piper Advanced TTS worker on http://127.0.0.1:8020
echo First run may download voice models into .\voices\
.venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8020
