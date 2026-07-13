const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../services/advancedTtsMap.js');
let s = fs.readFileSync(file, 'utf8');

// Force every Indian cast engine onto real en_IN neural
s = s.replace(
  /(slot\('in_[fmco]_\d+',[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*')([^']+)(')/g,
  "$1en_IN-spicor-medium$3"
);

// Accent pools + fallback for Indian English
s = s.replace(
  /\/\/ Indic Piper = real Indian speaker timbre \(self-hosted\)\n\s*'Indian English': \{[^}]+\}/,
  `// Real Indian English neural (SPICOR) — not US FX, not Hindi
  'Indian English': { male: 'en_IN-spicor-medium', female: 'en_IN-spicor-medium', children: 'en_IN-spicor-medium', old: 'en_IN-spicor-medium', custom: 'en_IN-spicor-medium' }`
);

s = s.replace(
  /'Indian English': \{\s*female: \[[^\]]+\],\s*male: \[[^\]]+\],\s*children: \[[^\]]+\],\s*old: \[[^\]]+\],\s*custom: \[[^\]]+\],\s*\}/,
  `'Indian English': {
    female: ['en_IN-spicor-medium'],
    male: ['en_IN-spicor-medium'],
    children: ['en_IN-spicor-medium'],
    old: ['en_IN-spicor-medium'],
    custom: ['en_IN-spicor-medium'],
  }`
);

s = s.replace(
  /\/\/ Strong Indian signature on top of Indic Piper timbre\n\s*'Indian English': \{[^}]+\}/,
  `// Light polish only — accent comes from en_IN-spicor neural, not EQ theater
  'Indian English': { treble: 0.6, bass: 0.5, tempo: 0.97, formant: 1.0, air: 0.15, syllable: true }`
);

fs.writeFileSync(file, s);
delete require.cache[require.resolve('../services/advancedTtsMap')];
const { listAdvancedVoices, ACCENT_VOICE_POOLS, ACCENT_FX_BIAS } = require('../services/advancedTtsMap');
const ind = listAdvancedVoices().filter((v) => v.accent === 'Indian English');
console.log('indian voices', ind.length, 'engines', [...new Set(ind.map((v) => v.localVoice))].join(','));
console.log('pool', ACCENT_VOICE_POOLS['Indian English'].female.join(','));
console.log('fx', ACCENT_FX_BIAS['Indian English']);
