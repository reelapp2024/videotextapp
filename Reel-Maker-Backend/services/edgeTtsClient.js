var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var edgeTtsClient_exports = {};
__export(edgeTtsClient_exports, {
  computeTtsTimeoutMs: () => computeTtsTimeoutMs,
  synthesizeEdgeTts: () => synthesizeEdgeTts
});
module.exports = __toCommonJS(edgeTtsClient_exports);
var import_ws = __toESM(require("ws"), 1);
var import_node_crypto = require("node:crypto");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_ttsTextNormalize = require("./ttsTextNormalize");
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = process.env.EDGE_TTS_CHROMIUM_VERSION || "143.0.3650.75";
const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;
const CHROME_MAJOR = CHROMIUM_FULL_VERSION.split(".")[0] || "143";
function generateSecMsGecToken() {
  let ticks = Date.now() / 1e3 + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = `${Math.floor(ticks)}${TRUSTED_CLIENT_TOKEN}`;
  return (0, import_node_crypto.createHash)("sha256").update(strToHash, "ascii").digest("hex").toUpperCase();
}
function dateToString() {
  const d = /* @__PURE__ */ new Date();
  const w = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const y = d.getUTCFullYear();
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${w} ${mon} ${day} ${y} ${h}:${mi}:${s} GMT+0000 (Coordinated Universal Time)`;
}
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}
function removeIncompatibleCharacters(input) {
  let out = "";
  for (const char of input) {
    const code = char.charCodeAt(0);
    if (code >= 0 && code <= 8 || code >= 11 && code <= 12 || code >= 14 && code <= 31) {
      out += " ";
    } else {
      out += char;
    }
  }
  return out;
}
function buildSsml(xmlLang, voiceId, rate, pitch, volume, innerContent) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${escapeXml(xmlLang)}">
  <voice name="${escapeXml(voiceId)}">
    <prosody rate="${escapeXml(rate)}" pitch="${escapeXml(pitch)}" volume="${escapeXml(volume)}">
      ${innerContent}
    </prosody>
  </voice>
</speak>`;
}
function extractMpegAudioChunk(buf) {
  if (buf.length >= 2) {
    const headerLength = buf.readUInt16BE(0);
    if (headerLength > 0 && 2 + headerLength <= buf.length) {
      const headerBytes = buf.subarray(2, 2 + headerLength);
      const headerStr = headerBytes.toString("utf8");
      const headers = {};
      for (const line of headerStr.split("\r\n")) {
        const i = line.indexOf(":");
        if (i > 0) headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      const p = headers.Path || headers.path;
      if (p === "audio") {
        const contentType = headers["Content-Type"] || headers["Content-type"];
        const data = buf.subarray(2 + headerLength);
        if (contentType === void 0 || contentType === "") {
          if (data.length === 0) return "skip";
          return null;
        }
        if (contentType !== "audio/mpeg" && !String(contentType || "").startsWith("audio/mpeg")) return "skip";
        if (data.length === 0) return null;
        return data;
      }
    }
  }
  const sep = Buffer.from("Path:audio\r\n");
  const idx = buf.indexOf(sep);
  if (idx >= 0) {
    const audioData = buf.subarray(idx + sep.length);
    return audioData.length > 0 ? audioData : "skip";
  }
  return "skip";
}
const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_MAJOR}.0.0.0 Safari/537.36 Edg/${CHROME_MAJOR}.0.0.0`;
function pathFromTextFrame(message) {
  const m = message.match(/\bPath:\s*([^\r\n]+)/i);
  return m ? m[1].trim() : null;
}
const BENIGN_TEXT_PATHS = new Set(
  ["audio.metadata", "response", "turn.start"].map((s) => s.toLowerCase())
);
function isEdgeTtsFailurePath(p) {
  if (!p) return false;
  const low = p.toLowerCase();
  if (BENIGN_TEXT_PATHS.has(low)) return false;
  if (low === "turn.end" || low === "ssml") return false;
  if (low === "error" || low.startsWith("error.")) return true;
  return false;
}
function computeTtsTimeoutMs(text) {
  const len = String(text ?? "").length;
  const base = 12e4;
  const perChar = 80;
  const max = 3e5;
  return Math.min(max, base + len * perChar);
}
async function synthesizeEdgeTts(opts) {
  const { text, outputPath, xmlLang, voiceShort, innerContent } = opts;
  const timeoutMs = opts.timeoutMs ?? computeTtsTimeoutMs(text);
  const idleAfterAudioMs = 6e4;
  const connectWaitMs = Math.max(timeoutMs, 18e4);
  let { rate, pitch, volume } = opts;
  if (rate === "default") rate = "+0%";
  if (pitch === "default") pitch = "+0Hz";
  if (volume === "default") volume = "+0%";
  const voiceId = voiceShort.trim();
  const secGec = generateSecMsGecToken();
  const connectionId = (0, import_node_crypto.randomBytes)(16).toString("hex");
  const muid = (0, import_node_crypto.randomBytes)(16).toString("hex").toUpperCase();
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}&Sec-MS-GEC=${secGec}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`;
  await import_fs.default.promises.mkdir(import_path.default.dirname(outputPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const ws = new import_ws.default(wsUrl, {
      host: "speech.platform.bing.com",
      headers: {
        "User-Agent": USER_AGENT,
        Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        Cookie: `muid=${muid};`,
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const stream = import_fs.default.createWriteStream(outputPath);
    stream.on("error", () => {
    });
    let settled = false;
    let gotAudio = false;
    let timer;
    const armTimeout = () => {
      if (timer !== void 0) clearTimeout(timer);
      const ms = gotAudio ? idleAfterAudioMs : connectWaitMs;
      timer = setTimeout(() => {
        fail(new Error(`Edge TTS timed out (no response for ${Math.round(ms / 1e3)}s)`));
      }, ms);
    };
    const safeWrite = (chunk) => {
      if (settled) return;
      if (stream.destroyed || !stream.writable) return;
      try {
        stream.write(chunk);
      } catch (_) {
      }
    };
    const fail = (err) => {
      if (settled) return;
      settled = true;
      if (timer !== void 0) clearTimeout(timer);
      try {
        ws.terminate();
      } catch (_) {
      }
      try {
        stream.destroy();
      } catch (_) {
      }
      import_fs.default.unlink(outputPath, () => {
      });
      reject(err);
    };
    const ok = () => {
      if (settled) return;
      settled = true;
      if (timer !== void 0) clearTimeout(timer);
      try {
        stream.end(() => {
          try {
            ws.close();
          } catch (_) {
          }
          resolve();
        });
      } catch (_) {
        try {
          ws.close();
        } catch (_2) {
        }
        resolve();
      }
    };
    armTimeout();
    ws.on("open", () => {
      armTimeout();
      const ts1 = dateToString();
      const cfgMsg = `X-Timestamp:${ts1}\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
` + JSON.stringify({
        context: {
          synthesis: {
            audio: {
              metadataoptions: { sentenceBoundaryEnabled: "true", wordBoundaryEnabled: "false" },
              outputFormat: "audio-24khz-96kbitrate-mono-mp3"
            }
          }
        }
      });
      ws.send(cfgMsg + "\r\n");
      const requestId = (0, import_node_crypto.randomBytes)(16).toString("hex");
      const ts2 = dateToString();
      const inner = innerContent ?? (0, import_ttsTextNormalize.buildTtsSpeechInner)(text, xmlLang);
      const ssml = buildSsml(xmlLang, voiceId, rate, pitch, volume, inner);
      const ssmlMsg = `X-RequestId:${requestId}\r
Content-Type:application/ssml+xml\r
X-Timestamp:${ts2}Z\r
Path:ssml\r
\r
` + ssml;
      ws.send(ssmlMsg);
      armTimeout();
    });
    ws.on("message", (data, isBinary) => {
      if (settled) return;
      if (isBinary) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const parsed = extractMpegAudioChunk(buf);
        if (parsed && Buffer.isBuffer(parsed) && parsed.length > 0) {
          gotAudio = true;
          safeWrite(parsed);
          armTimeout();
        }
        return;
      }
      armTimeout();
      const message = typeof data === "string" ? data : data.toString();
      const path2 = pathFromTextFrame(message);
      if (path2?.toLowerCase() === "turn.end") {
        if (timer !== void 0) clearTimeout(timer);
        if (!gotAudio) {
          fail(new Error("Edge TTS finished without audio (voice or SSML rejected)."));
          return;
        }
        ok();
        return;
      }
      if (path2 && BENIGN_TEXT_PATHS.has(path2.toLowerCase())) return;
      if (path2 && path2.toLowerCase() === "ssml") return;
      if (isEdgeTtsFailurePath(path2)) {
        if (timer !== void 0) clearTimeout(timer);
        fail(new Error(`Edge TTS: ${message.replace(/\r\n/g, " ").slice(0, 400)}`));
        return;
      }
    });
    ws.on("error", (e) => {
      if (timer !== void 0) clearTimeout(timer);
      fail(e instanceof Error ? e : new Error(String(e)));
    });
    ws.on("close", (code, reason) => {
      if (settled) return;
      if (timer !== void 0) clearTimeout(timer);
      if (gotAudio) {
        ok();
        return;
      }
      const r = reason?.toString() || "";
      fail(new Error(`WebSocket closed before audio (${code}) ${r}`));
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  computeTtsTimeoutMs,
  synthesizeEdgeTts
});
