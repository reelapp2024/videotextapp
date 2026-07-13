/**
 * One-shot rebuild of ADVANCED_VOICE_LIBRARY (accent-casted names).
 * Run: node scripts/rebuildAdvancedCast.js
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../services/advancedTtsMap.js');
let src = fs.readFileSync(file, 'utf8');
const end = src.indexOf('const EMOTION_PROSODY = {');
if (end < 0) throw new Error('EMOTION_PROSODY marker missing');

const EMO_CYCLE = ['vocal_smile', 'newscaster', 'empathetic', 'hype', 'deadpan', 'character', 'whisper'];
const US_F = ['en_US-lessac-medium', 'en_US-amy-medium', 'en_US-kristin-medium', 'en_US-ljspeech-high', 'en_US-hfc_female-medium'];
const US_M = ['en_US-ryan-high', 'en_US-joe-medium', 'en_US-danny-low', 'en_US-hfc_male-medium'];
const GB_F = ['en_GB-alba-medium', 'en_GB-cori-high', 'en_GB-semaine-medium'];
const GB_M = ['en_GB-alan-medium', 'en_GB-northern_english_male-medium'];
const IN_F = ['hi_IN-priyamvada-medium'];
const IN_M = ['hi_IN-pratham-medium', 'hi_IN-rohan-medium'];

function buildCast(prefix, accent, type, people, engines, emotions, ageBase) {
  return people.map((p, i) => {
    const eng = engines[i % engines.length];
    const emo = emotions[i % emotions.length];
    const age =
      type === 'children' ? String(11 + (i % 6)) : type === 'old' ? String(58 + (i % 8)) : String(ageBase + (i % 12));
    const bias =
      type === 'children'
        ? { lengthScale: 0.88 + (i % 5) * 0.02, noiseScale: 0.8 }
        : type === 'old'
          ? { lengthScale: 1.14 + (i % 5) * 0.02, noiseScale: 0.5 }
          : { lengthScale: 0.95 + (i % 6) * 0.02, noiseScale: 0.65 + (i % 4) * 0.04 };
    return {
      id: `${prefix}_${String(i + 1).padStart(2, '0')}`,
      name: p.name,
      personality: p.role,
      age,
      accent,
      emotion: emo,
      type,
      localVoice: eng,
      lengthScale: bias.lengthScale,
      noiseScale: bias.noiseScale,
    };
  });
}

const casts = [];
const add = (...args) => casts.push(args);

add('usg_f', 'American (Gen)', 'female', [
  { name: 'Emma Wilson', role: 'Warm host' }, { name: 'Ava Johnson', role: 'Studio lead' },
  { name: 'Olivia Brooks', role: 'Clear narrator' }, { name: 'Sophia Carter', role: 'Bright energy' },
  { name: 'Mia Thompson', role: 'Friendly host' }, { name: 'Charlotte Hayes', role: 'Polished news' },
  { name: 'Amelia Reed', role: 'Soft invite' }, { name: 'Harper Quinn', role: 'Upbeat lead' },
], US_F, EMO_CYCLE, 26);
add('usg_m', 'American (Gen)', 'male', [
  { name: 'Liam Anderson', role: 'Clear male lead' }, { name: 'Noah Bennett', role: 'Studio male' },
  { name: 'Ethan Carter', role: 'Firm narrator' }, { name: 'Mason Brooks', role: 'Deep host' },
  { name: 'Logan Hayes', role: 'Laid-back lead' }, { name: 'Jacob Reed', role: 'News male' },
  { name: 'Aiden Quinn', role: 'Bright male' }, { name: 'Jackson Cole', role: 'Bass authority' },
], US_M, EMO_CYCLE, 32);
add('usg_c', 'American (Gen)', 'children', [
  { name: 'Lily Parker', role: 'Soft youth' }, { name: 'Emma Blake', role: 'Bright youth' },
  { name: 'Sophie Lane', role: 'Playful youth' }, { name: 'Mia Cole', role: 'Sunny youth' },
  { name: 'Zoe Hart', role: 'Clear youth' }, { name: 'Ava Finn', role: 'Host youth' },
], US_F, ['hype', 'vocal_smile', 'character'], 12);
add('usg_o', 'American (Gen)', 'old', [
  { name: 'Robert Hale', role: 'Deep elder' }, { name: 'William Grant', role: 'Steady elder' },
  { name: 'James Porter', role: 'Bass elder' }, { name: 'Margaret Ellis', role: 'Warm elder' },
  { name: 'Helen Brooks', role: 'Clear elder' }, { name: 'Thomas Ward', role: 'Story elder' },
], [...US_M, ...US_F], ['empathetic', 'deadpan', 'newscaster'], 60);

add('usv_f', 'American (Valley)', 'female', [
  { name: 'Madison Blake', role: 'Valley bright' }, { name: 'Ashley Cruz', role: 'Upbeat valley' },
  { name: 'Kayla Simmons', role: 'Soft valley' }, { name: 'Brittany Cole', role: 'Pop energy' },
  { name: 'Taylor Reese', role: 'Laid-back host' }, { name: 'Jordan Blake', role: 'Casual lead' },
], ['en_US-amy-medium', 'en_US-ljspeech-high', 'en_US-kristin-medium'], EMO_CYCLE, 24);
add('usv_m', 'American (Valley)', 'male', [
  { name: 'Tyler Brooks', role: 'Casual male' }, { name: 'Brayden Cole', role: 'Chill host' },
  { name: 'Dylan Hayes', role: 'Valley lead' }, { name: 'Hunter Quinn', role: 'Laid-back deep' },
  { name: 'Cody Reed', role: 'Bright male' }, { name: 'Austin Lane', role: 'Easy narrator' },
], ['en_US-joe-medium', 'en_US-ryan-high', 'en_US-hfc_male-medium'], EMO_CYCLE, 28);
add('usv_c', 'American (Valley)', 'children', [
  { name: 'Skylar Beau', role: 'Valley youth' }, { name: 'Riley Quinn', role: 'Bright kid' },
  { name: 'Casey Bloom', role: 'Playful kid' }, { name: 'Jamie Frost', role: 'Soft kid' },
], ['en_US-amy-medium', 'en_US-ljspeech-high'], ['hype', 'vocal_smile'], 12);
add('usv_o', 'American (Valley)', 'old', [
  { name: 'Gary Holt', role: 'Relaxed elder' }, { name: 'Diane Moss', role: 'Warm elder' },
  { name: 'Steve Quinn', role: 'Calm elder' }, { name: 'Nancy Reed', role: 'Soft elder' },
], ['en_US-hfc_male-medium', 'en_US-danny-low', 'en_US-amy-medium'], ['empathetic', 'deadpan'], 58);

add('uss_f', 'American (South)', 'female', [
  { name: 'Savannah Lee', role: 'Warm southern' }, { name: 'Daisy Mae', role: 'Southern soft' },
  { name: 'Caroline Dunn', role: 'Southern host' }, { name: 'Belle Harper', role: 'Gentle south' },
  { name: 'Ruby Quinn', role: 'Story south' }, { name: 'June Carter', role: 'Classic south' },
], ['en_US-hfc_female-medium', 'en_US-lessac-medium', 'en_US-kristin-medium'], EMO_CYCLE, 30);
add('uss_m', 'American (South)', 'male', [
  { name: 'Jesse Cole', role: 'Southern lead' }, { name: 'Wade Harper', role: 'Deep south' },
  { name: 'Clay Boone', role: 'Bass south' }, { name: 'Hank Miller', role: 'Steady south' },
  { name: 'Beau Tanner', role: 'Warm south' }, { name: 'Troy Ellis', role: 'Story south' },
], ['en_US-danny-low', 'en_US-hfc_male-medium', 'en_US-joe-medium'], EMO_CYCLE, 38);
add('uss_c', 'American (South)', 'children', [
  { name: 'Daisy Belle', role: 'Southern youth' }, { name: 'Annie Rose', role: 'Soft south kid' },
  { name: 'Lucy June', role: 'Bright south kid' }, { name: 'Holly Mae', role: 'Playful south' },
], ['en_US-kristin-medium', 'en_US-amy-medium'], ['vocal_smile', 'hype'], 12);
add('uss_o', 'American (South)', 'old', [
  { name: 'Earl Boone', role: 'Bass elder' }, { name: 'Ruth Harper', role: 'Warm elder' },
  { name: 'Clyde Dunn', role: 'Deep elder' }, { name: 'Mabel Quinn', role: 'Story elder' },
], ['en_US-danny-low', 'en_US-hfc_male-medium', 'en_US-hfc_female-medium'], ['deadpan', 'empathetic'], 62);

add('uk_f', 'British (RP)', 'female', [
  { name: 'Charlotte Whitmore', role: 'BBC host' }, { name: 'Olivia Hartley', role: 'RP clear' },
  { name: 'Emily Croft', role: 'Classic British' }, { name: 'Amelia Sinclair', role: 'Polished lead' },
  { name: 'Sophie Langley', role: 'Warm RP' }, { name: 'Isabella Rowe', role: 'News British' },
  { name: 'Grace Pembroke', role: 'Soft RP' }, { name: 'Alice Thornton', role: 'Studio RP' },
], GB_F, EMO_CYCLE, 28);
add('uk_m', 'British (RP)', 'male', [
  { name: 'Oliver Croft', role: 'BBC depth' }, { name: 'James Whitaker', role: 'RP narrator' },
  { name: 'William Hartley', role: 'Classic British' }, { name: 'Henry Langley', role: 'Firm RP' },
  { name: 'George Sinclair', role: 'Deep host' }, { name: 'Edward Rowe', role: 'News male' },
  { name: 'Arthur Pembroke', role: 'Warm RP' }, { name: 'Charles Thornton', role: 'Studio British' },
], GB_M, EMO_CYCLE, 36);
add('uk_c', 'British (RP)', 'children', [
  { name: 'Maisie Croft', role: 'UK youth' }, { name: 'Poppy Hartley', role: 'Bright UK kid' },
  { name: 'Lily Sinclair', role: 'Soft UK kid' }, { name: 'Daisy Langley', role: 'Playful UK' },
  { name: 'Rosie Pembroke', role: 'Clear UK youth' }, { name: 'Ellie Rowe', role: 'Host youth' },
], GB_F, ['hype', 'vocal_smile', 'empathetic'], 12);
add('uk_o', 'British (RP)', 'old', [
  { name: 'Margaret Whitmore', role: 'BBC elder' }, { name: 'Harold Croft', role: 'Deep elder' },
  { name: 'Evelyn Hartley', role: 'Warm elder' }, { name: 'Reginald Sinclair', role: 'Classic elder' },
  { name: 'Dorothy Langley', role: 'Soft elder' }, { name: 'Alfred Rowe', role: 'Steady elder' },
], [...GB_M, ...GB_F], ['empathetic', 'newscaster', 'deadpan'], 62);

add('ukb_f', 'British (Brixton)', 'female', [
  { name: 'Isla Bright', role: 'UK street bright' }, { name: 'Tia Morgan', role: 'Urban UK host' },
  { name: 'Jade Coleman', role: 'Street energy' }, { name: 'Nia Brooks', role: 'Bold UK lead' },
  { name: 'Keisha Reed', role: 'Bright Brixton' }, { name: 'Aaliyah Cole', role: 'Warm urban' },
], ['en_GB-cori-high', 'en_GB-semaine-medium', 'en_GB-alba-medium'], EMO_CYCLE, 26);
add('ukb_m', 'British (Brixton)', 'male', [
  { name: 'Atlas Ryan', role: 'UK narrator' }, { name: 'Jordan Blake', role: 'Urban male' },
  { name: 'Marcus Cole', role: 'Street depth' }, { name: 'Devon Reed', role: 'Bold host' },
  { name: 'Kai Morgan', role: 'Bright urban' }, { name: 'Leon Brooks', role: 'Steady urban' },
], GB_M, EMO_CYCLE, 34);
add('ukb_c', 'British (Brixton)', 'children', [
  { name: 'Tia Spark', role: 'Urban youth' }, { name: 'Nia Pop', role: 'Bright kid' },
  { name: 'Jade Tiny', role: 'Playful urban' }, { name: 'Isla Kid', role: 'Street youth' },
], ['en_GB-cori-high', 'en_GB-semaine-medium'], ['hype', 'vocal_smile'], 12);
add('ukb_o', 'British (Brixton)', 'old', [
  { name: 'Winston Cole', role: 'Urban elder' }, { name: 'Gloria Reed', role: 'Warm elder' },
  { name: 'Clarence Brooks', role: 'Deep elder' }, { name: 'Pearl Morgan', role: 'Soft elder' },
], [...GB_M, 'en_GB-alba-medium'], ['deadpan', 'empathetic'], 60);

add('in_f', 'Indian English', 'female', [
  { name: 'Priya Sharma', role: 'Warm IN host' }, { name: 'Ananya Iyer', role: 'Clear IN lead' },
  { name: 'Kavya Reddy', role: 'Bright IN energy' }, { name: 'Meera Kapoor', role: 'Soft IN invite' },
  { name: 'Sneha Joshi', role: 'News IN host' }, { name: 'Divya Nair', role: 'Polished IN' },
  { name: 'Aisha Khan', role: 'Friendly IN' }, { name: 'Pooja Desai', role: 'Studio IN' },
  { name: 'Riya Malhotra', role: 'Upbeat IN' }, { name: 'Neha Banerjee', role: 'Gentle IN' },
], IN_F, EMO_CYCLE, 27);
add('in_m', 'Indian English', 'male', [
  { name: 'Arjun Mehta', role: 'IN male lead' }, { name: 'Rohan Patel', role: 'Clear IN host' },
  { name: 'Vikram Singh', role: 'Deep IN narrator' }, { name: 'Aditya Rao', role: 'Firm IN lead' },
  { name: 'Kabir Malhotra', role: 'Warm IN' }, { name: 'Nikhil Gupta', role: 'News IN male' },
  { name: 'Sameer Khan', role: 'Bright IN' }, { name: 'Rajesh Iyer', role: 'Studio IN' },
  { name: 'Aman Sharma', role: 'Steady IN' }, { name: 'Karan Desai', role: 'Bass IN' },
], IN_M, EMO_CYCLE, 33);
add('in_c', 'Indian English', 'children', [
  { name: 'Aarohi Sharma', role: 'Soft IN youth' }, { name: 'Anvi Patel', role: 'Bright IN kid' },
  { name: 'Myra Reddy', role: 'Playful IN' }, { name: 'Kiara Nair', role: 'Sunny IN youth' },
  { name: 'Sara Kapoor', role: 'Clear IN kid' }, { name: 'Diya Joshi', role: 'Host youth IN' },
], IN_F, ['hype', 'vocal_smile', 'character'], 12);
add('in_o', 'Indian English', 'old', [
  { name: 'Suresh Mehta', role: 'Deep IN elder' }, { name: 'Lakshmi Iyer', role: 'Warm IN elder' },
  { name: 'Ramesh Patel', role: 'Steady IN elder' }, { name: 'Sunita Reddy', role: 'Soft IN elder' },
  { name: 'Madhur Singh', role: 'Bass IN elder' }, { name: 'Kamala Rao', role: 'Story IN elder' },
], [...IN_M, ...IN_F], ['deadpan', 'empathetic', 'newscaster'], 62);

add('au_f', 'Australian', 'female', [
  { name: 'Harper Hayes', role: 'Aussie host' }, { name: 'Chloe Bennett', role: 'Bright Aussie' },
  { name: 'Matilda Crowe', role: 'Warm AU' }, { name: 'Isla Murray', role: 'Clear AU' },
  { name: 'Zoe Sullivan', role: 'Upbeat AU' }, { name: 'Ruby Nash', role: 'Friendly AU' },
], ['en_US-amy-medium', 'en_GB-cori-high', 'en_US-ljspeech-high'], EMO_CYCLE, 28);
add('au_m', 'Australian', 'male', [
  { name: 'Blake Reid', role: 'Aussie depth' }, { name: 'Jack Murray', role: 'AU male lead' },
  { name: 'Liam Crowe', role: 'Clear AU' }, { name: 'Noah Sullivan', role: 'Warm AU' },
  { name: 'Ethan Nash', role: 'Steady AU' }, { name: 'Harvey Blake', role: 'Deep AU' },
], ['en_US-ryan-high', 'en_GB-northern_english_male-medium', 'en_US-joe-medium'], EMO_CYCLE, 34);
add('au_c', 'Australian', 'children', [
  { name: 'Molly Kiwi', role: 'AU youth' }, { name: 'Billie Nash', role: 'Bright AU kid' },
  { name: 'Pippa Crowe', role: 'Soft AU kid' }, { name: 'Tilly Murray', role: 'Playful AU' },
], ['en_US-ljspeech-high', 'en_US-amy-medium'], ['vocal_smile', 'hype'], 12);
add('au_o', 'Australian', 'old', [
  { name: 'Bruce Murray', role: 'AU elder' }, { name: 'Helen Crowe', role: 'Warm AU elder' },
  { name: 'Craig Nash', role: 'Deep AU elder' }, { name: 'Judy Sullivan', role: 'Soft AU elder' },
], ['en_US-joe-medium', 'en_US-danny-low', 'en_US-amy-medium'], ['empathetic', 'deadpan'], 61);

add('ta_f', 'Transatlantic', 'female', [
  { name: 'Victoria Lang', role: 'Classic polish' }, { name: 'Catherine Vale', role: 'Cinema host' },
  { name: 'Eleanor Frost', role: 'Warm classic' }, { name: 'Genevieve Moore', role: 'Studio polish' },
  { name: 'Beatrice Quinn', role: 'Soft classic' }, { name: 'Lillian Cross', role: 'Clear classic' },
], ['en_US-kristin-medium', 'en_GB-alba-medium', 'en_US-lessac-medium'], EMO_CYCLE, 34);
add('ta_m', 'Transatlantic', 'male', [
  { name: 'Marcus Vale', role: 'Bass authority' }, { name: 'Sebastian Cross', role: 'Classic male' },
  { name: 'Julian Frost', role: 'Deep polish' }, { name: 'Frederick Moore', role: 'Warm classic' },
  { name: 'Theodore Quinn', role: 'Studio classic' }, { name: 'Vincent Lang', role: 'Firm classic' },
], ['en_US-hfc_male-medium', 'en_GB-alan-medium', 'en_US-danny-low'], EMO_CYCLE, 42);
add('ta_c', 'Transatlantic', 'children', [
  { name: 'Clara Vale', role: 'Classic youth' }, { name: 'Felix Quinn', role: 'Bright classic kid' },
  { name: 'Iris Frost', role: 'Soft classic kid' }, { name: 'Hugo Moore', role: 'Playful classic' },
], ['en_US-amy-medium', 'en_GB-cori-high'], ['vocal_smile', 'hype'], 13);
add('ta_o', 'Transatlantic', 'old', [
  { name: 'Steffan Deep', role: 'Deep storyteller' }, { name: 'Helena Vale', role: 'Warm classic elder' },
  { name: 'Conrad Frost', role: 'Bass classic elder' }, { name: 'Lillian Elder', role: 'Soft classic elder' },
], ['en_US-danny-low', 'en_US-lessac-medium', 'en_GB-alan-medium'], ['empathetic', 'deadpan'], 60);

add('neu_f', 'Neutral', 'female', [
  { name: 'Clara North', role: 'Neutral clear' }, { name: 'Elena Frost', role: 'Clean host' },
  { name: 'Nadia Cole', role: 'Studio neutral' }, { name: 'Irene Blake', role: 'Soft clear' },
  { name: 'Paula Reed', role: 'News clear' }, { name: 'Nina Hart', role: 'Warm clear' },
], US_F, EMO_CYCLE, 30);
add('neu_m', 'Neutral', 'male', [
  { name: 'Daniel North', role: 'Neutral male' }, { name: 'Chris Vale', role: 'Clear male' },
  { name: 'Adam Cole', role: 'Studio male' }, { name: 'Ben Hart', role: 'Steady male' },
  { name: 'Luke Reed', role: 'Deep clear' }, { name: 'Sam Blake', role: 'Warm male' },
], US_M, EMO_CYCLE, 34);
add('neu_c', 'Neutral', 'children', [
  { name: 'Luna Pop', role: 'Bright youth' }, { name: 'Ellie Beam', role: 'Soft youth' },
  { name: 'Max Spark', role: 'Playful youth' }, { name: 'Nora Lite', role: 'Clear youth' },
], US_F, ['hype', 'vocal_smile'], 12);
add('neu_o', 'Neutral', 'old', [
  { name: 'Joe Elder', role: 'Steady elder' }, { name: 'Helen Clear', role: 'Warm elder' },
  { name: 'Frank Vale', role: 'Deep elder' }, { name: 'Ruth North', role: 'Soft elder' },
], [...US_M, 'en_US-lessac-medium'], ['newscaster', 'empathetic'], 60);

let library = [];
for (const c of casts) library = library.concat(buildCast(...c));
library.push(
  { id: 'adv_clone_a', name: 'Clone Slot A', personality: 'Your reference', age: '—', accent: 'Custom', emotion: 'character', type: 'custom', localVoice: 'en_US-ryan-high', lengthScale: null, noiseScale: null },
  { id: 'adv_clone_b', name: 'Clone Slot B', personality: 'Brand reference', age: '—', accent: 'Custom', emotion: 'vocal_smile', type: 'custom', localVoice: 'en_US-lessac-medium', lengthScale: null, noiseScale: null },
  { id: 'adv_clone_c', name: 'Clone Slot C', personality: 'Alt reference', age: '—', accent: 'Custom', emotion: 'empathetic', type: 'custom', localVoice: 'en_US-amy-medium', lengthScale: null, noiseScale: null }
);

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function ser(v) {
  const ls = v.lengthScale == null ? 'null' : v.lengthScale;
  const ns = v.noiseScale == null ? 'null' : v.noiseScale;
  return `  slot('${v.id}', '${esc(v.name)}', '${esc(v.personality)}', '${esc(v.age)}', '${esc(v.accent)}', '${v.emotion}', '${v.type}', '${v.localVoice}', { lengthScale: ${ls}, noiseScale: ${ns} })`;
}

const header = `/**
 * Advanced TTS — self-hosted Piper voices (no Azure / Edge).
 * Roster is accent-casted: Indian accent → Indian names + Indic voices, etc.
 */

const PIPER_FEMALE = [
  'en_US-lessac-medium',
  'en_US-amy-medium',
  'en_US-kristin-medium',
  'en_US-ljspeech-high',
  'en_US-hfc_female-medium',
  'en_GB-alba-medium',
  'en_GB-cori-high',
  'en_GB-semaine-medium',
];

const PIPER_MALE = [
  'en_US-ryan-high',
  'en_US-joe-medium',
  'en_US-danny-low',
  'en_US-hfc_male-medium',
  'en_GB-alan-medium',
  'en_GB-northern_english_male-medium',
];

function slot(id, name, personality, age, accent, emotion, type, localVoice, bias = {}) {
  return {
    id,
    name,
    personality,
    age,
    accent,
    emotion,
    type,
    localVoice,
    lengthScale: bias.lengthScale ?? null,
    noiseScale: bias.noiseScale ?? null,
    speakerId: bias.speakerId ?? null,
  };
}

const ADVANCED_VOICE_LIBRARY = [
${library.map(ser).join(',\n')}
].map((v) => ({ ...v, clone: v.type === 'custom', edgeSpeaker: v.localVoice, speaker: v.localVoice }));

`;

fs.writeFileSync(file, header + src.slice(end));
const counts = {};
for (const v of library) {
  const k = `${v.accent}|${v.type}`;
  counts[k] = (counts[k] || 0) + 1;
}
console.log('total', library.length);
console.log('Indian English|female', counts['Indian English|female']);
console.log('American (Gen)|female', counts['American (Gen)|female']);
console.log('British (RP)|male', counts['British (RP)|male']);
