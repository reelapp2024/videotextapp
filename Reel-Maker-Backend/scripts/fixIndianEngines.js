const fs = require('fs');
const p = require('path').join(__dirname, '../services/advancedTtsMap.js');
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/'hi_IN-priyamvada-medium'/g, "'en_US-kristin-medium'");
s = s.replace(/'hi_IN-pratham-medium'/g, "'en_US-ryan-high'");
s = s.replace(/'hi_IN-rohan-medium'/g, "'en_US-danny-low'");
s = s.replace("'Indian English': 'hi'", "'Indian English': 'en-us'");
s = s.replace(
  "'Indian English': { treble: 2.4, bass: 0.8, tempo: 0.97, formant: 1.06, air: 0.7, syllable: true }",
  "'Indian English': { treble: 2.6, bass: 1.0, tempo: 0.96, formant: 1.08, air: 0.85, syllable: true }"
);
fs.writeFileSync(p, s);
const { ACCENT_EDGE_FALLBACK, ACCENT_VOICE_POOLS, ACCENT_ESPEAK, listAdvancedVoices } = require('../services/advancedTtsMap');
console.log('IN fallback', ACCENT_EDGE_FALLBACK['Indian English']);
console.log('IN pool', ACCENT_VOICE_POOLS['Indian English']);
console.log('IN espeak', ACCENT_ESPEAK['Indian English']);
console.log('Priya', listAdvancedVoices().find((v) => v.id === 'in_f_01'));
