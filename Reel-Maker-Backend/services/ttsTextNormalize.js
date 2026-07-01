var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ttsTextNormalize_exports = {};
__export(ttsTextNormalize_exports, {
  buildTtsSpeechInner: () => buildTtsSpeechInner,
  buildTtsSpeechMinimal: () => buildTtsSpeechMinimal,
  buildTtsSpeechPlain: () => buildTtsSpeechPlain,
  isLikelySsmlRejectError: () => isLikelySsmlRejectError,
  mergePitchHz: () => mergePitchHz
});
module.exports = __toCommonJS(ttsTextNormalize_exports);
const DEVANAGARI_DIGITS = "\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F";
const ARABIC_INDIC_DIGITS = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
function escapeXmlText(unsafe) {
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
function normalizeUnicodeDigits(input) {
  let out = "";
  for (const ch of input) {
    const d1 = DEVANAGARI_DIGITS.indexOf(ch);
    if (d1 >= 0) {
      out += String(d1);
      continue;
    }
    const d2 = ARABIC_INDIC_DIGITS.indexOf(ch);
    if (d2 >= 0) {
      out += String(d2);
      continue;
    }
    out += ch;
  }
  return out;
}
function stripControlChars(input) {
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
function stripNonSpeakable(input) {
  return input.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, " ").replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}
function spellDigits(digits) {
  return digits.split("").join(" ");
}
function mergePitchHz(userPitch, baseHz) {
  if (!baseHz) return userPitch;
  const m = String(userPitch || "+0Hz").trim().match(/^([+-]?\d+)Hz$/i);
  const user = m ? parseInt(m[1], 10) : 0;
  const total = Math.max(-50, Math.min(50, user + baseHz));
  return (total >= 0 ? "+" : "") + total + "Hz";
}
function buildTtsSpeechPlain(text, _lang = "en-US") {
  let s = stripNonSpeakable(stripControlChars(normalizeUnicodeDigits(String(text ?? "").trim())));
  if (!s) return " ";
  s = s.replace(/\+\d{1,3}[\s.-]*(?:\d[\s.-]*){8,14}\d/g, (m) => spellDigits(m.replace(/\D/g, "")));
  s = s.replace(/\b(?:\d{3,5}[\s.-]){1,3}\d{3,5}\b/g, (m) => {
    if (m.includes(",")) return m;
    const digits = m.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 15) return spellDigits(digits);
    return m;
  });
  s = s.replace(/([₹$€£])\s*([\d,]+(?:\.\d{1,2})?)/g, (_, sym, num) => {
    const n = num.replace(/,/g, "");
    if (sym === "\u20B9") return `${n} rupees`;
    if (sym === "$") return `${n} dollars`;
    if (sym === "\u20AC") return `${n} euros`;
    return `${n} pounds`;
  });
  s = s.replace(/Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/gi, (_, num) => `${num.replace(/,/g, "")} rupees`);
  s = s.replace(/\bINR\s*([\d,]+(?:\.\d{1,2})?)/gi, (_, num) => `${num.replace(/,/g, "")} rupees`);
  s = s.replace(/\b([\d,]+(?:\.\d+)?)\s*%/g, (_, n) => `${n.replace(/,/g, "")} percent`);
  s = s.replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1$2");
  s = s.replace(
    /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/gi,
    (m) => m.replace(/\s+/g, " ").trim()
  );
  s = s.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, (m) => m.replace(/,/g, ""));
  s = s.replace(/\b\d{7,}\b/g, (m) => spellDigits(m));
  s = s.replace(/\betc\./gi, "etcetera");
  s = s.replace(/\be\.g\./gi, "for example");
  s = s.replace(/\bi\.e\./gi, "that is");
  s = s.replace(/\bvs\./gi, "versus");
  s = s.replace(/\bMr\./g, "Mister ");
  s = s.replace(/\bMrs\./g, "Missus ");
  s = s.replace(/\bDr\./g, "Doctor ");
  s = s.replace(/\bNo\./g, "Number ");
  s = stripNonSpeakable(s);
  const escaped = escapeXmlText(s);
  return escaped || " ";
}
function buildTtsSpeechInner(text, lang = "en-US") {
  return buildTtsSpeechPlain(text, lang);
}
function buildTtsSpeechMinimal(text) {
  const s = stripControlChars(String(text ?? "").trim());
  return escapeXmlText(s) || " ";
}
function isLikelySsmlRejectError(message) {
  const m = message.toLowerCase();
  return m.includes("ssml is invalid") || m.includes("ssml rejected") || m.includes("(1007)");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildTtsSpeechInner,
  buildTtsSpeechMinimal,
  buildTtsSpeechPlain,
  isLikelySsmlRejectError,
  mergePitchHz
});
