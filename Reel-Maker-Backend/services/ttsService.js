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
var ttsService_exports = {};
__export(ttsService_exports, {
  VOICE_LIBRARY: () => VOICE_LIBRARY,
  batchGenerateTTS: () => batchGenerateTTS,
  generateTTS: () => generateTTS
});
module.exports = __toCommonJS(ttsService_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_edgeTtsClient = require("./edgeTtsClient");
var import_ttsTextNormalize = require("./ttsTextNormalize");
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function isRetryableTtsError(msg) {
  const m = msg.toLowerCase();
  return m.includes("timed out") || m.includes("timeout") || m.includes("websocket") || m.includes("without audio") || m.includes("econnreset") || m.includes("etimedout") || m.includes("network") || m.includes("aborted");
}
const VOICE_LIBRARY = {
  // ── English USA — all 17 Edge en-US Neural (each ShortName once) ──
  en_jenny: { voice: "en-US-JennyNeural", lang: "en-US", gender: "female", label: "Jenny \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 0 },
  en_guy: { voice: "en-US-GuyNeural", lang: "en-US", gender: "male", label: "Guy \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: -2 },
  en_aria: { voice: "en-US-AriaNeural", lang: "en-US", gender: "female", label: "Aria \u2014 USA (bright)", category: "English USA", pitchTier: "high", basePitchHz: 5 },
  en_ava: { voice: "en-US-AvaNeural", lang: "en-US", gender: "female", label: "Ava \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 1 },
  en_brian: { voice: "en-US-BrianNeural", lang: "en-US", gender: "male", label: "Brian \u2014 USA (deep)", category: "English USA", pitchTier: "low", basePitchHz: -8 },
  en_andrew: { voice: "en-US-AndrewNeural", lang: "en-US", gender: "male", label: "Andrew \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: -3 },
  en_emma: { voice: "en-US-EmmaNeural", lang: "en-US", gender: "female", label: "Emma \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 0 },
  en_ana: { voice: "en-US-AnaNeural", lang: "en-US", gender: "female", label: "Ana \u2014 USA (soft)", category: "English USA", pitchTier: "high", basePitchHz: 9 },
  en_eric: { voice: "en-US-EricNeural", lang: "en-US", gender: "male", label: "Eric \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: -4 },
  en_michelle: { voice: "en-US-MichelleNeural", lang: "en-US", gender: "female", label: "Michelle \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 2 },
  en_roger: { voice: "en-US-RogerNeural", lang: "en-US", gender: "male", label: "Roger \u2014 USA (bass)", category: "English USA", pitchTier: "low", basePitchHz: -12 },
  en_steffan: { voice: "en-US-SteffanNeural", lang: "en-US", gender: "male", label: "Steffan \u2014 USA (deep)", category: "English USA", pitchTier: "low", basePitchHz: -10 },
  en_christopher: { voice: "en-US-ChristopherNeural", lang: "en-US", gender: "male", label: "Christopher \u2014 USA (bass)", category: "English USA", pitchTier: "low", basePitchHz: -9 },
  en_brian_ml: { voice: "en-US-BrianMultilingualNeural", lang: "en-US", gender: "male", label: "Brian \u2014 USA multilingual", category: "English USA", pitchTier: "low", basePitchHz: -7 },
  en_emma_ml: { voice: "en-US-EmmaMultilingualNeural", lang: "en-US", gender: "female", label: "Emma \u2014 USA multilingual", category: "English USA", pitchTier: "mid", basePitchHz: 0 },
  en_ava_ml: { voice: "en-US-AvaMultilingualNeural", lang: "en-US", gender: "female", label: "Ava \u2014 USA multilingual", category: "English USA", pitchTier: "mid", basePitchHz: 1 },
  en_andrew_ml: { voice: "en-US-AndrewMultilingualNeural", lang: "en-US", gender: "male", label: "Andrew \u2014 USA multilingual", category: "English USA", pitchTier: "mid", basePitchHz: -3 },
  // Additional US originals (append-only; existing voices untouched)
  en_amber: { voice: "en-US-AmberNeural", lang: "en-US", gender: "female", label: "Amber \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 1 },
  en_ashley: { voice: "en-US-AshleyNeural", lang: "en-US", gender: "female", label: "Ashley \u2014 USA", category: "English USA", pitchTier: "high", basePitchHz: 4 },
  en_cora: { voice: "en-US-CoraNeural", lang: "en-US", gender: "female", label: "Cora \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 0 },
  en_elizabeth: { voice: "en-US-ElizabethNeural", lang: "en-US", gender: "female", label: "Elizabeth \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 1 },
  en_jane: { voice: "en-US-JaneNeural", lang: "en-US", gender: "female", label: "Jane \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 0 },
  en_monica: { voice: "en-US-MonicaNeural", lang: "en-US", gender: "female", label: "Monica \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: 2 },
  en_nancy: { voice: "en-US-NancyNeural", lang: "en-US", gender: "female", label: "Nancy \u2014 USA", category: "English USA", pitchTier: "high", basePitchHz: 5 },
  en_sara: { voice: "en-US-SaraNeural", lang: "en-US", gender: "female", label: "Sara \u2014 USA", category: "English USA", pitchTier: "high", basePitchHz: 4 },
  en_brandon: { voice: "en-US-BrandonNeural", lang: "en-US", gender: "male", label: "Brandon \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: -3 },
  en_davis: { voice: "en-US-DavisNeural", lang: "en-US", gender: "male", label: "Davis \u2014 USA", category: "English USA", pitchTier: "low", basePitchHz: -6 },
  en_jacob: { voice: "en-US-JacobNeural", lang: "en-US", gender: "male", label: "Jacob \u2014 USA", category: "English USA", pitchTier: "low", basePitchHz: -5 },
  en_jason: { voice: "en-US-JasonNeural", lang: "en-US", gender: "male", label: "Jason \u2014 USA", category: "English USA", pitchTier: "mid", basePitchHz: -2 },
  en_tony: { voice: "en-US-TonyNeural", lang: "en-US", gender: "male", label: "Tony \u2014 USA", category: "English USA", pitchTier: "low", basePitchHz: -7 },
  // ── Punjabi — Edge has no pa-IN Neural; hi-IN + US voices with xml:lang pa-IN (romanized Punjabi best) ──
  pa_swara: { voice: "hi-IN-SwaraNeural", lang: "pa-IN", gender: "female", label: "Swara \u2014 Punjabi (female)", category: "Punjabi", pitchTier: "high", basePitchHz: 5 },
  pa_madhur: { voice: "hi-IN-MadhurNeural", lang: "pa-IN", gender: "male", label: "Madhur \u2014 Punjabi (male, deep)", category: "Punjabi", pitchTier: "low", basePitchHz: -10 },
  pa_jenny: { voice: "en-US-JennyNeural", lang: "pa-IN", gender: "female", label: "Jenny \u2014 Punjabi (US female)", category: "Punjabi", pitchTier: "mid", basePitchHz: 0 },
  pa_guy: { voice: "en-US-GuyNeural", lang: "pa-IN", gender: "male", label: "Guy \u2014 Punjabi (US male)", category: "Punjabi", pitchTier: "mid", basePitchHz: -2 },
  pa_aria: { voice: "en-US-AriaNeural", lang: "pa-IN", gender: "female", label: "Aria \u2014 Punjabi (bright)", category: "Punjabi", pitchTier: "high", basePitchHz: 4 },
  pa_emma_ml: { voice: "en-US-EmmaMultilingualNeural", lang: "pa-IN", gender: "female", label: "Emma \u2014 Punjabi (multilingual)", category: "Punjabi", pitchTier: "mid", basePitchHz: 0 },
  pa_andrew_ml: { voice: "en-US-AndrewMultilingualNeural", lang: "pa-IN", gender: "male", label: "Andrew \u2014 Punjabi (multilingual)", category: "Punjabi", pitchTier: "mid", basePitchHz: -3 },
  pa_brian: { voice: "en-US-BrianNeural", lang: "pa-IN", gender: "male", label: "Brian \u2014 Punjabi (deep)", category: "Punjabi", pitchTier: "low", basePitchHz: -8 },
  // ── Hindi ──
  hi_swara: { voice: "hi-IN-SwaraNeural", lang: "hi-IN", gender: "female", label: "Swara (Hindi)", category: "Hindi", pitchTier: "high", basePitchHz: 5 },
  hi_madhur: { voice: "hi-IN-MadhurNeural", lang: "hi-IN", gender: "male", label: "Madhur \u2014 deep (Hindi)", category: "Hindi", pitchTier: "low", basePitchHz: -10 },
  // ── English UK — all 5 Edge en-GB Neural ──
  en_gb_sonia: { voice: "en-GB-SoniaNeural", lang: "en-GB", gender: "female", label: "Sonia \u2014 UK", category: "English UK", pitchTier: "mid", basePitchHz: 0 },
  en_gb_libby: { voice: "en-GB-LibbyNeural", lang: "en-GB", gender: "female", label: "Libby \u2014 UK (bright)", category: "English UK", pitchTier: "high", basePitchHz: 7 },
  en_gb_maisie: { voice: "en-GB-MaisieNeural", lang: "en-GB", gender: "female", label: "Maisie \u2014 UK (youth)", category: "English UK", pitchTier: "high", basePitchHz: 8 },
  en_gb_ryan: { voice: "en-GB-RyanNeural", lang: "en-GB", gender: "male", label: "Ryan \u2014 UK (deep)", category: "English UK", pitchTier: "low", basePitchHz: -9 },
  en_gb_thomas: { voice: "en-GB-ThomasNeural", lang: "en-GB", gender: "male", label: "Thomas \u2014 UK", category: "English UK", pitchTier: "low", basePitchHz: -7 },
  // ── English Australia — all 2 Edge en-AU Neural ──
  en_au_natasha: { voice: "en-AU-NatashaNeural", lang: "en-AU", gender: "female", label: "Natasha \u2014 Australia", category: "English AU", pitchTier: "mid", basePitchHz: 2 },
  en_au_william: { voice: "en-AU-WilliamMultilingualNeural", lang: "en-AU", gender: "male", label: "William \u2014 Australia (deep)", category: "English AU", pitchTier: "low", basePitchHz: -8 },
  // ── English Canada — all 2 Edge en-CA Neural ──
  en_ca_clara: { voice: "en-CA-ClaraNeural", lang: "en-CA", gender: "female", label: "Clara \u2014 Canada", category: "English Canada", pitchTier: "mid", basePitchHz: 1 },
  en_ca_liam: { voice: "en-CA-LiamNeural", lang: "en-CA", gender: "male", label: "Liam \u2014 Canada", category: "English Canada", pitchTier: "mid", basePitchHz: -4 },
  // ── English Ireland & New Zealand (extra distinct accents) ──
  en_ie_emily: { voice: "en-IE-EmilyNeural", lang: "en-IE", gender: "female", label: "Emily \u2014 Ireland", category: "English Ireland", pitchTier: "mid", basePitchHz: 3 },
  en_ie_connor: { voice: "en-IE-ConnorNeural", lang: "en-IE", gender: "male", label: "Connor \u2014 Ireland", category: "English Ireland", pitchTier: "low", basePitchHz: -6 },
  en_nz_molly: { voice: "en-NZ-MollyNeural", lang: "en-NZ", gender: "female", label: "Molly \u2014 New Zealand", category: "English NZ", pitchTier: "high", basePitchHz: 5 },
  en_nz_mitchell: { voice: "en-NZ-MitchellNeural", lang: "en-NZ", gender: "male", label: "Mitchell \u2014 New Zealand", category: "English NZ", pitchTier: "mid", basePitchHz: -3 },
  // ── English (India) ──
  en_in_neerja: { voice: "en-IN-NeerjaNeural", lang: "en-IN", gender: "female", label: "Neerja (India English)", category: "English IN", pitchTier: "mid", basePitchHz: 2 },
  en_in_prabhat: { voice: "en-IN-PrabhatNeural", lang: "en-IN", gender: "male", label: "Prabhat (India English)", category: "English IN", pitchTier: "low", basePitchHz: -7 },
  en_in_neerja_exp: { voice: "en-IN-NeerjaExpressiveNeural", lang: "en-IN", gender: "female", label: "Neerja expressive (India)", category: "English IN", pitchTier: "high", basePitchHz: 5 },
  // ── Indian regional ──
  bn_bashkar: { voice: "bn-IN-BashkarNeural", lang: "bn-IN", gender: "male", label: "Bashkar (Bengali)", category: "Indian Regional", pitchTier: "low", basePitchHz: -6 },
  bn_tanishaa: { voice: "bn-IN-TanishaaNeural", lang: "bn-IN", gender: "female", label: "Tanishaa (Bengali)", category: "Indian Regional", pitchTier: "high", basePitchHz: 5 },
  ta_pallavi: { voice: "ta-IN-PallaviNeural", lang: "ta-IN", gender: "female", label: "Pallavi (Tamil)", category: "Indian Regional", pitchTier: "mid", basePitchHz: 2 },
  ta_valluvar: { voice: "ta-IN-ValluvarNeural", lang: "ta-IN", gender: "male", label: "Valluvar (Tamil)", category: "Indian Regional", pitchTier: "low", basePitchHz: -7 },
  te_mohan: { voice: "te-IN-MohanNeural", lang: "te-IN", gender: "male", label: "Mohan (Telugu)", category: "Indian Regional", pitchTier: "low", basePitchHz: -6 },
  te_shruti: { voice: "te-IN-ShrutiNeural", lang: "te-IN", gender: "female", label: "Shruti (Telugu)", category: "Indian Regional", pitchTier: "high", basePitchHz: 4 },
  mr_aarohi: { voice: "mr-IN-AarohiNeural", lang: "mr-IN", gender: "female", label: "Aarohi (Marathi)", category: "Indian Regional", pitchTier: "high", basePitchHz: 5 },
  mr_manohar: { voice: "mr-IN-ManoharNeural", lang: "mr-IN", gender: "male", label: "Manohar (Marathi)", category: "Indian Regional", pitchTier: "low", basePitchHz: -7 },
  gu_dhwani: { voice: "gu-IN-DhwaniNeural", lang: "gu-IN", gender: "female", label: "Dhwani (Gujarati)", category: "Indian Regional", pitchTier: "mid", basePitchHz: 2 },
  gu_niranjan: { voice: "gu-IN-NiranjanNeural", lang: "gu-IN", gender: "male", label: "Niranjan (Gujarati)", category: "Indian Regional", pitchTier: "low", basePitchHz: -6 },
  kn_gagan: { voice: "kn-IN-GaganNeural", lang: "kn-IN", gender: "male", label: "Gagan (Kannada)", category: "Indian Regional", pitchTier: "mid", basePitchHz: -3 },
  kn_sapna: { voice: "kn-IN-SapnaNeural", lang: "kn-IN", gender: "female", label: "Sapna (Kannada)", category: "Indian Regional", pitchTier: "high", basePitchHz: 5 },
  ml_midhun: { voice: "ml-IN-MidhunNeural", lang: "ml-IN", gender: "male", label: "Midhun (Malayalam)", category: "Indian Regional", pitchTier: "low", basePitchHz: -6 },
  ml_sobhana: { voice: "ml-IN-SobhanaNeural", lang: "ml-IN", gender: "female", label: "Sobhana (Malayalam)", category: "Indian Regional", pitchTier: "high", basePitchHz: 4 },
  ur_asad: { voice: "ur-PK-AsadNeural", lang: "ur-PK", gender: "male", label: "Asad (Urdu)", category: "Indian Regional", pitchTier: "low", basePitchHz: -7 },
  ur_uzma: { voice: "ur-PK-UzmaNeural", lang: "ur-PK", gender: "female", label: "Uzma (Urdu)", category: "Indian Regional", pitchTier: "mid", basePitchHz: 2 },
  // ── International ──
  fr_denise: { voice: "fr-FR-DeniseNeural", lang: "fr-FR", gender: "female", label: "Denise (French)", category: "International", pitchTier: "mid", basePitchHz: 0 },
  fr_henri: { voice: "fr-FR-HenriNeural", lang: "fr-FR", gender: "male", label: "Henri (French)", category: "International", pitchTier: "low", basePitchHz: -6 },
  de_katja: { voice: "de-DE-KatjaNeural", lang: "de-DE", gender: "female", label: "Katja (German)", category: "International", pitchTier: "mid", basePitchHz: 0 },
  de_conrad: { voice: "de-DE-ConradNeural", lang: "de-DE", gender: "male", label: "Conrad (German)", category: "International", pitchTier: "low", basePitchHz: -7 },
  es_elvira: { voice: "es-ES-ElviraNeural", lang: "es-ES", gender: "female", label: "Elvira (Spanish)", category: "International", pitchTier: "mid", basePitchHz: 1 },
  es_alvaro: { voice: "es-ES-AlvaroNeural", lang: "es-ES", gender: "male", label: "Alvaro (Spanish)", category: "International", pitchTier: "low", basePitchHz: -6 },
  ar_zariyah: { voice: "ar-SA-ZariyahNeural", lang: "ar-SA", gender: "female", label: "Zariyah (Arabic)", category: "International", pitchTier: "mid", basePitchHz: 2 },
  ar_hamed: { voice: "ar-SA-HamedNeural", lang: "ar-SA", gender: "male", label: "Hamed (Arabic)", category: "International", pitchTier: "low", basePitchHz: -8 },
  ja_nanami: { voice: "ja-JP-NanamiNeural", lang: "ja-JP", gender: "female", label: "Nanami (Japanese)", category: "International", pitchTier: "high", basePitchHz: 4 },
  ja_keita: { voice: "ja-JP-KeitaNeural", lang: "ja-JP", gender: "male", label: "Keita (Japanese)", category: "International", pitchTier: "low", basePitchHz: -5 },
  ko_sunhi: { voice: "ko-KR-SunHiNeural", lang: "ko-KR", gender: "female", label: "Sun-Hi (Korean)", category: "International", pitchTier: "mid", basePitchHz: 3 },
  ko_injoon: { voice: "ko-KR-InJoonNeural", lang: "ko-KR", gender: "male", label: "InJoon (Korean)", category: "International", pitchTier: "low", basePitchHz: -6 },
  zh_xiaoxiao: { voice: "zh-CN-XiaoxiaoNeural", lang: "zh-CN", gender: "female", label: "Xiaoxiao (Chinese)", category: "International", pitchTier: "mid", basePitchHz: 2 },
  zh_yunxi: { voice: "zh-CN-YunxiNeural", lang: "zh-CN", gender: "male", label: "Yunxi (Chinese)", category: "International", pitchTier: "low", basePitchHz: -5 },
  pt_francisca: { voice: "pt-BR-FranciscaNeural", lang: "pt-BR", gender: "female", label: "Francisca (Portuguese)", category: "International", pitchTier: "mid", basePitchHz: 1 },
  pt_antonio: { voice: "pt-BR-AntonioNeural", lang: "pt-BR", gender: "male", label: "Antonio (Portuguese)", category: "International", pitchTier: "low", basePitchHz: -6 },
  it_elsa: { voice: "it-IT-ElsaNeural", lang: "it-IT", gender: "female", label: "Elsa (Italian)", category: "International", pitchTier: "mid", basePitchHz: 0 },
  it_diego: { voice: "it-IT-DiegoNeural", lang: "it-IT", gender: "male", label: "Diego (Italian)", category: "International", pitchTier: "low", basePitchHz: -5 },
  tr_emel: { voice: "tr-TR-EmelNeural", lang: "tr-TR", gender: "female", label: "Emel (Turkish)", category: "International", pitchTier: "mid", basePitchHz: 2 },
  tr_ahmet: { voice: "tr-TR-AhmetNeural", lang: "tr-TR", gender: "male", label: "Ahmet (Turkish)", category: "International", pitchTier: "low", basePitchHz: -6 },
  // ── Preset aliases (saved projects) ──
  multi_jane: { voice: "en-US-EmmaMultilingualNeural", lang: "en-US", gender: "female", label: "Emma multilingual (preset)", category: "Premium", pitchTier: "mid", basePitchHz: 0 },
  multi_andrew: { voice: "en-US-AndrewMultilingualNeural", lang: "en-US", gender: "male", label: "Andrew multilingual (preset)", category: "Premium", pitchTier: "mid", basePitchHz: -3 },
  multi_jenny: { voice: "en-US-JennyNeural", lang: "en-US", gender: "female", label: "Jenny (preset)", category: "Premium", pitchTier: "mid", basePitchHz: 0 }
};
const SPEAKER_KEY_MAP = {
  woman: "en_jenny",
  man: "en_guy",
  woman_young: "en_aria",
  man_young: "en_andrew",
  woman_old: "en_emma",
  man_old: "en_brian",
  hindiWoman: "hi_swara",
  hindiMan: "hi_madhur",
  punjabiWoman: "pa_swara",
  punjabiMan: "pa_madhur",
  punjabiFemale: "pa_swara",
  punjabiMale: "pa_madhur",
  woman_deep: "en_gb_sonia",
  man_deep: "en_roger",
  woman_high: "en_ana",
  man_deep_us: "en_christopher",
  ukWoman: "en_gb_sonia",
  ukMan: "en_gb_ryan",
  auWoman: "en_au_natasha",
  auMan: "en_au_william",
  caWoman: "en_ca_clara",
  caMan: "en_ca_liam",
  usaWoman: "en_jenny",
  usaMan: "en_guy"
};
function langFromVoiceName(voiceName) {
  const match = voiceName.match(/^([a-z]{2}-[A-Z]{2})-/i);
  return match ? match[1] : "en-US";
}
function resolveVoice(speaker) {
  if (!speaker || typeof speaker !== "string") return VOICE_LIBRARY.en_jenny;
  const key = speaker.trim();
  if (VOICE_LIBRARY[key]) return VOICE_LIBRARY[key];
  const mapped = SPEAKER_KEY_MAP[key];
  if (mapped && VOICE_LIBRARY[mapped]) return VOICE_LIBRARY[mapped];
  if (key.includes("Neural")) {
    return {
      voice: key,
      lang: langFromVoiceName(key),
      gender: "female",
      label: key,
      category: "Other",
      pitchTier: "mid",
      basePitchHz: 0
    };
  }
  return VOICE_LIBRARY.en_jenny;
}
function ttsErrMsg(e) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return String(e) || "Unknown error";
}
async function generateTTS(text, outputPath, speaker = "en_jenny", rate = "+0%", pitch = "+0Hz", volume = "+0%", quality = "balanced") {
  const cfg = resolveVoice(speaker);
  const effectivePitch = (0, import_ttsTextNormalize.mergePitchHz)(pitch, cfg.basePitchHz);
  const timeoutMs = (0, import_edgeTtsClient.computeTtsTimeoutMs)(text);
  const maxAttempts = 6;
  const runOnce = async (innerContent) => {
    await (0, import_edgeTtsClient.synthesizeEdgeTts)({
      text,
      outputPath,
      xmlLang: cfg.lang,
      voiceShort: cfg.voice,
      rate,
      pitch: effectivePitch,
      volume,
      timeoutMs,
      innerContent
    });
  };
  let lastErr = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await runOnce();
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(ttsErrMsg(e));
      const msg = lastErr.message;
      if ((0, import_ttsTextNormalize.isLikelySsmlRejectError)(msg)) {
        console.warn(`[TTS] SSML rejected, minimal retry: ${cfg.voice}`);
        await runOnce((0, import_ttsTextNormalize.buildTtsSpeechMinimal)(text));
        lastErr = null;
        break;
      }
      if (attempt < maxAttempts - 1 && isRetryableTtsError(msg)) {
        await delay(1200 * (attempt + 1));
        continue;
      }
      throw lastErr;
    }
  }
  if (lastErr) throw lastErr;
  const st = import_fs.default.statSync(outputPath);
  if (!st.size || st.size < 80) {
    try {
      import_fs.default.unlinkSync(outputPath);
    } catch (_) {
    }
    throw new Error("TTS output empty or too small (check network / Edge limits).");
  }
}
function getParallelTts(jobCount) {
  const env = parseInt(process.env.TTS_PARALLEL || "", 10);
  let p;
  if (Number.isFinite(env) && env >= 1) {
    p = env;
  } else if (jobCount > 30) {
    p = 2;
  } else if (jobCount > 15) {
    p = 3;
  } else {
    p = 4;
  }
  return Math.min(6, Math.max(1, p), Math.max(1, jobCount));
}
async function batchGenerateTTS(texts, outDir, speaker = "en_jenny", rate = "+0%", pitch = "+0Hz", volume = "+0%", quality = "balanced", onProgress) {
  if (!import_fs.default.existsSync(outDir)) import_fs.default.mkdirSync(outDir, { recursive: true });
  const jobs = texts.map((t, i) => ({ text: String(t ?? "").trim(), index: i })).filter((j) => j.text.length > 0);
  if (jobs.length === 0) return [];
  const slots = new Array(texts.length).fill(null);
  const parallel = getParallelTts(jobs.length);
  console.log(`[TTS] Batch: ${jobs.length} item(s), parallel=${parallel} (env TTS_PARALLEL=1\u20136)`);
  const countDone = () => slots.filter((p) => Boolean(p)).length;
  const publishProgress = async (itemIndex, filePath) => {
    const outputPaths = slots.filter((p) => Boolean(p));
    const done = countDone();
    const percent = Math.round(done / jobs.length * 90);
    if (onProgress) {
      await onProgress({
        percent,
        completed: done,
        total: jobs.length,
        itemIndex,
        filePath,
        outputPaths
      });
    }
  };
  const trySynthesizeJob = async (job) => {
    if (slots[job.index]) return;
    const outPath = import_path.default.join(outDir, `tts_${job.index + 1}.mp3`);
    await generateTTS(job.text, outPath, speaker, rate, pitch, volume, quality);
    if (!import_fs.default.existsSync(outPath)) throw new Error("TTS file missing after synthesis");
    slots[job.index] = outPath;
    await publishProgress(job.index, outPath);
  };
  let cursor = 0;
  const runWorker = async (workerId) => {
    await delay(300 * workerId);
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        await trySynthesizeJob(job);
      } catch (e) {
        console.error(`TTS error for item ${job.index + 1}:`, ttsErrMsg(e));
      }
    }
  };
  const workers = [];
  for (let w = 0; w < parallel; w++) {
    workers.push(runWorker(w));
  }
  await Promise.allSettled(workers);
  let pending = jobs.filter((j) => !slots[j.index]);
  if (pending.length > 0) {
    console.warn(`[TTS] ${pending.length} item(s) pending \u2014 sequential retry until all succeed\u2026`);
  }
  for (let round = 0; pending.length > 0 && round < 10; round++) {
    for (const job of [...pending]) {
      try {
        await delay(1500 + round * 500);
        await trySynthesizeJob(job);
      } catch (e) {
        console.error(`[TTS] Retry round ${round + 1} item ${job.index + 1}:`, ttsErrMsg(e));
      }
    }
    pending = jobs.filter((j) => !slots[j.index]);
  }
  const missing = jobs.filter((j) => !slots[j.index]);
  if (missing.length > 0) {
    const nums = missing.map((j) => j.index + 1).join(", ");
    throw new Error(
      `TTS incomplete: ${missing.length}/${jobs.length} items failed after retries (rows: ${nums}). Try TTS_PARALLEL=2 or smaller batch.`
    );
  }
  console.log(`[TTS] Batch complete: ${jobs.length}/${jobs.length} items`);
  return slots.filter((p) => Boolean(p));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VOICE_LIBRARY,
  batchGenerateTTS,
  generateTTS
});
