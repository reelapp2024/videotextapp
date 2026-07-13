const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../services/advancedTtsMap.js');
let s = fs.readFileSync(file, 'utf8');
const femaleEng = ['en_US-kristin-medium', 'en_US-amy-medium', 'en_US-lessac-medium', 'en_US-hfc_female-medium'];
const maleEng = ['en_US-ryan-high', 'en_US-danny-low', 'en_US-joe-medium', 'en_US-hfc_male-medium'];
const childEng = ['en_US-amy-medium', 'en_US-kristin-medium', 'en_US-ljspeech-high'];
const oldEng = ['en_US-danny-low', 'en_US-ryan-high', 'en_US-joe-medium', 'en_US-kristin-medium'];

function rotate(prefix, engines) {
  let i = 0;
  s = s.replace(new RegExp(`(slot\\('${prefix}_\\d+',[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\\s*')([^']+)(')`, 'g'), (_, a, _old, c) => {
    const eng = engines[i % engines.length];
    i += 1;
    return `${a}${eng}${c}`;
  });
}

rotate('in_f', femaleEng);
rotate('in_m', maleEng);
rotate('in_c', childEng);
rotate('in_o', oldEng);
fs.writeFileSync(file, s);
delete require.cache[require.resolve('../services/advancedTtsMap')];
const { listAdvancedVoices } = require('../services/advancedTtsMap');
console.log(listAdvancedVoices().filter((v) => v.accent === 'Indian English' && v.type === 'female').map((v) => `${v.name}:${v.localVoice}`).join('\n'));
