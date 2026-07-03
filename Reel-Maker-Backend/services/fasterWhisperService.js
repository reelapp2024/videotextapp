const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SCRIPT_PATH = path.join(__dirname, '../scripts/transcribe_faster_whisper.py');
const LOG_PREFIX = '[faster-whisper]';

function logWhisper(label, detail) {
  if (detail !== undefined) {
    console.log(`${LOG_PREFIX} ${label}`, detail);
  } else {
    console.log(`${LOG_PREFIX} ${label}`);
  }
}

function probePython(executable, prefixArgs = []) {
  const args = [...prefixArgs, '--version'];
  const command = [executable, ...args].join(' ');

  const result = spawnSync(executable, args, {
    encoding: 'utf8',
    windowsHide: true,
  });

  const probe = {
    executable,
    prefixArgs,
    command,
    exitCode: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    spawnError: result.error ? result.error.message : null,
  };

  probe.ok = result.status === 0 && !result.error;
  logWhisper('python probe', probe);
  return probe;
}

/**
 * Resolve a working Python executable.
 * Priority: PYTHON_PATH → python → py (Windows launcher).
 * Invalid PYTHON_PATH is skipped (logged) and fallbacks are tried.
 */
function resolvePythonCommand() {
  const candidates = [];

  if (process.env.PYTHON_PATH) {
    candidates.push({
      source: 'PYTHON_PATH',
      executable: process.env.PYTHON_PATH,
      prefixArgs: [],
    });
  }

  candidates.push(
    { source: 'python', executable: 'python', prefixArgs: [] },
    { source: 'py', executable: 'py', prefixArgs: [] },
  );

  const failures = [];

  for (const candidate of candidates) {
    const probe = probePython(candidate.executable, candidate.prefixArgs);
    if (probe.ok) {
      logWhisper('selected executable', {
        source: candidate.source,
        executable: candidate.executable,
        prefixArgs: candidate.prefixArgs,
        version: probe.stdout || probe.stderr,
      });
      return {
        executable: candidate.executable,
        prefixArgs: candidate.prefixArgs,
        source: candidate.source,
      };
    }

    const reason = probe.spawnError
      || probe.stderr
      || probe.stdout
      || `exit code ${probe.exitCode}`;
    failures.push(`${candidate.source} (${candidate.executable}): ${reason}`);
  }

  throw new Error(
    `No working Python executable found. Tried:\n${failures.join('\n')}\n`
    + 'Fix PYTHON_PATH in .env or install Python 3.',
  );
}

function buildSpawnArgs(python, scriptArgs) {
  const needsPyScriptFlag = python.executable === 'py'
    && scriptArgs[0]
    && scriptArgs[0].endsWith('.py');
  return needsPyScriptFlag ? ['-3', ...scriptArgs] : [...python.prefixArgs, ...scriptArgs];
}

function formatRunFailure({ command, exitCode, stdout, stderr, spawnError }) {
  if (spawnError) {
    return `Failed to start Python (${command}): ${spawnError}`;
  }

  const detail = (stderr || stdout || '').trim();
  if (detail) {
    return `Voice-to-text failed (${command}, exit ${exitCode}): ${detail}`;
  }
  return `Voice-to-text failed (${command}, exit ${exitCode})`;
}

function runPython(python, scriptArgs, timeoutMs) {
  const spawnArgs = buildSpawnArgs(python, scriptArgs);
  const command = [python.executable, ...spawnArgs].join(' ');

  logWhisper('running command', { command, timeoutMs });

  return new Promise((resolve, reject) => {
    const proc = spawn(python.executable, spawnArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      env: {
        ...process.env,
        WHISPER_DEVICE: process.env.WHISPER_DEVICE || 'cpu',
        WHISPER_COMPUTE: process.env.WHISPER_COMPUTE || 'int8',
        WHISPER_CPU_THREADS: process.env.WHISPER_CPU_THREADS || String(Math.min(4, os.cpus().length || 4)),
      },
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Voice-to-text timed out after ${Math.round(timeoutMs / 1000)}s (${command})`));
    }, timeoutMs);

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      logWhisper('process finished', {
        command,
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });

      if (code !== 0) {
        reject(new Error(formatRunFailure({ command, exitCode: code, stdout, stderr })));
      } else {
        resolve({ stdout, stderr });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      logWhisper('process spawn error', {
        command,
        error: err.message,
        code: err.code,
      });
      reject(new Error(formatRunFailure({ command, spawnError: err.message })));
    });
  });
}

async function transcribeWithFasterWhisper(audioPath, options = {}) {
  if (!fs.existsSync(audioPath)) throw new Error(`Audio not found: ${audioPath}`);
  if (!fs.existsSync(SCRIPT_PATH)) throw new Error('transcribe_faster_whisper.py missing on server');

  const model = options.model || process.env.WHISPER_MODEL || 'base';
  const language = options.language || process.env.WHISPER_LANGUAGE || 'auto';
  const outJson = path.join(path.dirname(audioPath), `whisper-${uuidv4()}.json`);

  const { usePersistentWhisper, startWhisperServerPool, getWhisperServerPool } = require('./whisperServerPool');

  if (usePersistentWhisper()) {
    try {
      await startWhisperServerPool();
      const resultPath = await getWhisperServerPool().transcribe(audioPath, {
        model,
        language,
        outJson,
      });
      return parseWhisperJson(resultPath);
    } catch (err) {
      logWhisper('persistent pool failed — falling back to one-shot', err.message);
    }
  }

  const python = resolvePythonCommand();
  const timeoutMs = Math.max(
    180000,
    parseInt(process.env.WHISPER_TIMEOUT_MS || '1200000', 10) || 1200000,
  );

  await runPython(
    python,
    [SCRIPT_PATH, audioPath, outJson, model, language],
    timeoutMs,
  );

  return parseWhisperJson(outJson);
}

function parseWhisperJson(outJson) {
  const raw = JSON.parse(fs.readFileSync(outJson, 'utf-8'));
  try {
    fs.unlinkSync(outJson);
  } catch (_) {}

  const segments = (raw.segments || []).map((s, i) => ({
    id: `seg-${i}`,
    start: s.start,
    end: s.end,
    text: s.text,
    words: s.words || [],
  }));

  return { language: raw.language ?? null, duration: raw.duration ?? null, segments };
}

module.exports = { transcribeWithFasterWhisper, resolvePythonCommand };
