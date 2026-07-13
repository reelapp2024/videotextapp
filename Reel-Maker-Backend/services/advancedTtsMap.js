/**
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
  slot('usg_f_01', 'Emma Wilson', 'Warm host', '26', 'American (Gen)', 'vocal_smile', 'female', 'en_US-lessac-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('usg_f_02', 'Ava Johnson', 'Studio lead', '27', 'American (Gen)', 'newscaster', 'female', 'en_US-amy-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('usg_f_03', 'Olivia Brooks', 'Clear narrator', '28', 'American (Gen)', 'empathetic', 'female', 'en_US-kristin-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('usg_f_04', 'Sophia Carter', 'Bright energy', '29', 'American (Gen)', 'hype', 'female', 'en_US-ljspeech-high', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('usg_f_05', 'Mia Thompson', 'Friendly host', '30', 'American (Gen)', 'deadpan', 'female', 'en_US-hfc_female-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('usg_f_06', 'Charlotte Hayes', 'Polished news', '31', 'American (Gen)', 'character', 'female', 'en_US-lessac-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('usg_f_07', 'Amelia Reed', 'Soft invite', '32', 'American (Gen)', 'whisper', 'female', 'en_US-amy-medium', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('usg_f_08', 'Harper Quinn', 'Upbeat lead', '33', 'American (Gen)', 'vocal_smile', 'female', 'en_US-kristin-medium', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('usg_m_01', 'Liam Anderson', 'Clear male lead', '32', 'American (Gen)', 'vocal_smile', 'male', 'en_US-ryan-high', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('usg_m_02', 'Noah Bennett', 'Studio male', '33', 'American (Gen)', 'newscaster', 'male', 'en_US-joe-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('usg_m_03', 'Ethan Carter', 'Firm narrator', '34', 'American (Gen)', 'empathetic', 'male', 'en_US-danny-low', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('usg_m_04', 'Mason Brooks', 'Deep host', '35', 'American (Gen)', 'hype', 'male', 'en_US-hfc_male-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('usg_m_05', 'Logan Hayes', 'Laid-back lead', '36', 'American (Gen)', 'deadpan', 'male', 'en_US-ryan-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('usg_m_06', 'Jacob Reed', 'News male', '37', 'American (Gen)', 'character', 'male', 'en_US-joe-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('usg_m_07', 'Aiden Quinn', 'Bright male', '38', 'American (Gen)', 'whisper', 'male', 'en_US-danny-low', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('usg_m_08', 'Jackson Cole', 'Bass authority', '39', 'American (Gen)', 'vocal_smile', 'male', 'en_US-hfc_male-medium', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('usg_c_01', 'Lily Parker', 'Soft youth', '11', 'American (Gen)', 'hype', 'children', 'en_US-lessac-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('usg_c_02', 'Emma Blake', 'Bright youth', '12', 'American (Gen)', 'vocal_smile', 'children', 'en_US-amy-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('usg_c_03', 'Sophie Lane', 'Playful youth', '13', 'American (Gen)', 'character', 'children', 'en_US-kristin-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('usg_c_04', 'Mia Cole', 'Sunny youth', '14', 'American (Gen)', 'hype', 'children', 'en_US-ljspeech-high', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('usg_c_05', 'Zoe Hart', 'Clear youth', '15', 'American (Gen)', 'vocal_smile', 'children', 'en_US-hfc_female-medium', { lengthScale: 0.96, noiseScale: 0.8 }),
  slot('usg_c_06', 'Ava Finn', 'Host youth', '16', 'American (Gen)', 'character', 'children', 'en_US-lessac-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('usg_o_01', 'Robert Hale', 'Deep elder', '58', 'American (Gen)', 'empathetic', 'old', 'en_US-ryan-high', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('usg_o_02', 'William Grant', 'Steady elder', '59', 'American (Gen)', 'deadpan', 'old', 'en_US-joe-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('usg_o_03', 'James Porter', 'Bass elder', '60', 'American (Gen)', 'newscaster', 'old', 'en_US-danny-low', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('usg_o_04', 'Margaret Ellis', 'Warm elder', '61', 'American (Gen)', 'empathetic', 'old', 'en_US-hfc_male-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('usg_o_05', 'Helen Brooks', 'Clear elder', '62', 'American (Gen)', 'deadpan', 'old', 'en_US-lessac-medium', { lengthScale: 1.22, noiseScale: 0.5 }),
  slot('usg_o_06', 'Thomas Ward', 'Story elder', '63', 'American (Gen)', 'newscaster', 'old', 'en_US-amy-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('usv_f_01', 'Madison Blake', 'Valley bright', '24', 'American (Valley)', 'vocal_smile', 'female', 'en_US-amy-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('usv_f_02', 'Ashley Cruz', 'Upbeat valley', '25', 'American (Valley)', 'newscaster', 'female', 'en_US-ljspeech-high', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('usv_f_03', 'Kayla Simmons', 'Soft valley', '26', 'American (Valley)', 'empathetic', 'female', 'en_US-kristin-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('usv_f_04', 'Brittany Cole', 'Pop energy', '27', 'American (Valley)', 'hype', 'female', 'en_US-amy-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('usv_f_05', 'Taylor Reese', 'Laid-back host', '28', 'American (Valley)', 'deadpan', 'female', 'en_US-ljspeech-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('usv_f_06', 'Jordan Blake', 'Casual lead', '29', 'American (Valley)', 'character', 'female', 'en_US-kristin-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('usv_m_01', 'Tyler Brooks', 'Casual male', '28', 'American (Valley)', 'vocal_smile', 'male', 'en_US-joe-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('usv_m_02', 'Brayden Cole', 'Chill host', '29', 'American (Valley)', 'newscaster', 'male', 'en_US-ryan-high', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('usv_m_03', 'Dylan Hayes', 'Valley lead', '30', 'American (Valley)', 'empathetic', 'male', 'en_US-hfc_male-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('usv_m_04', 'Hunter Quinn', 'Laid-back deep', '31', 'American (Valley)', 'hype', 'male', 'en_US-joe-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('usv_m_05', 'Cody Reed', 'Bright male', '32', 'American (Valley)', 'deadpan', 'male', 'en_US-ryan-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('usv_m_06', 'Austin Lane', 'Easy narrator', '33', 'American (Valley)', 'character', 'male', 'en_US-hfc_male-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('usv_c_01', 'Skylar Beau', 'Valley youth', '11', 'American (Valley)', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('usv_c_02', 'Riley Quinn', 'Bright kid', '12', 'American (Valley)', 'vocal_smile', 'children', 'en_US-ljspeech-high', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('usv_c_03', 'Casey Bloom', 'Playful kid', '13', 'American (Valley)', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('usv_c_04', 'Jamie Frost', 'Soft kid', '14', 'American (Valley)', 'vocal_smile', 'children', 'en_US-ljspeech-high', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('usv_o_01', 'Gary Holt', 'Relaxed elder', '58', 'American (Valley)', 'empathetic', 'old', 'en_US-hfc_male-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('usv_o_02', 'Diane Moss', 'Warm elder', '59', 'American (Valley)', 'deadpan', 'old', 'en_US-danny-low', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('usv_o_03', 'Steve Quinn', 'Calm elder', '60', 'American (Valley)', 'empathetic', 'old', 'en_US-amy-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('usv_o_04', 'Nancy Reed', 'Soft elder', '61', 'American (Valley)', 'deadpan', 'old', 'en_US-hfc_male-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('uss_f_01', 'Savannah Lee', 'Warm southern', '30', 'American (South)', 'vocal_smile', 'female', 'en_US-hfc_female-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('uss_f_02', 'Daisy Mae', 'Southern soft', '31', 'American (South)', 'newscaster', 'female', 'en_US-lessac-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('uss_f_03', 'Caroline Dunn', 'Southern host', '32', 'American (South)', 'empathetic', 'female', 'en_US-kristin-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('uss_f_04', 'Belle Harper', 'Gentle south', '33', 'American (South)', 'hype', 'female', 'en_US-hfc_female-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('uss_f_05', 'Ruby Quinn', 'Story south', '34', 'American (South)', 'deadpan', 'female', 'en_US-lessac-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('uss_f_06', 'June Carter', 'Classic south', '35', 'American (South)', 'character', 'female', 'en_US-kristin-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('uss_m_01', 'Jesse Cole', 'Southern lead', '38', 'American (South)', 'vocal_smile', 'male', 'en_US-danny-low', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('uss_m_02', 'Wade Harper', 'Deep south', '39', 'American (South)', 'newscaster', 'male', 'en_US-hfc_male-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('uss_m_03', 'Clay Boone', 'Bass south', '40', 'American (South)', 'empathetic', 'male', 'en_US-joe-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('uss_m_04', 'Hank Miller', 'Steady south', '41', 'American (South)', 'hype', 'male', 'en_US-danny-low', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('uss_m_05', 'Beau Tanner', 'Warm south', '42', 'American (South)', 'deadpan', 'male', 'en_US-hfc_male-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('uss_m_06', 'Troy Ellis', 'Story south', '43', 'American (South)', 'character', 'male', 'en_US-joe-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('uss_c_01', 'Daisy Belle', 'Southern youth', '11', 'American (South)', 'vocal_smile', 'children', 'en_US-kristin-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('uss_c_02', 'Annie Rose', 'Soft south kid', '12', 'American (South)', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('uss_c_03', 'Lucy June', 'Bright south kid', '13', 'American (South)', 'vocal_smile', 'children', 'en_US-kristin-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('uss_c_04', 'Holly Mae', 'Playful south', '14', 'American (South)', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('uss_o_01', 'Earl Boone', 'Bass elder', '58', 'American (South)', 'deadpan', 'old', 'en_US-danny-low', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('uss_o_02', 'Ruth Harper', 'Warm elder', '59', 'American (South)', 'empathetic', 'old', 'en_US-hfc_male-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('uss_o_03', 'Clyde Dunn', 'Deep elder', '60', 'American (South)', 'deadpan', 'old', 'en_US-hfc_female-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('uss_o_04', 'Mabel Quinn', 'Story elder', '61', 'American (South)', 'empathetic', 'old', 'en_US-danny-low', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('uk_f_01', 'Charlotte Whitmore', 'BBC host', '28', 'British (RP)', 'vocal_smile', 'female', 'en_GB-alba-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('uk_f_02', 'Olivia Hartley', 'RP clear', '29', 'British (RP)', 'newscaster', 'female', 'en_GB-cori-high', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('uk_f_03', 'Emily Croft', 'Classic British', '30', 'British (RP)', 'empathetic', 'female', 'en_GB-semaine-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('uk_f_04', 'Amelia Sinclair', 'Polished lead', '31', 'British (RP)', 'hype', 'female', 'en_GB-alba-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('uk_f_05', 'Sophie Langley', 'Warm RP', '32', 'British (RP)', 'deadpan', 'female', 'en_GB-cori-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('uk_f_06', 'Isabella Rowe', 'News British', '33', 'British (RP)', 'character', 'female', 'en_GB-semaine-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('uk_f_07', 'Grace Pembroke', 'Soft RP', '34', 'British (RP)', 'whisper', 'female', 'en_GB-alba-medium', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('uk_f_08', 'Alice Thornton', 'Studio RP', '35', 'British (RP)', 'vocal_smile', 'female', 'en_GB-cori-high', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('uk_m_01', 'Oliver Croft', 'BBC depth', '36', 'British (RP)', 'vocal_smile', 'male', 'en_GB-alan-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('uk_m_02', 'James Whitaker', 'RP narrator', '37', 'British (RP)', 'newscaster', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('uk_m_03', 'William Hartley', 'Classic British', '38', 'British (RP)', 'empathetic', 'male', 'en_GB-alan-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('uk_m_04', 'Henry Langley', 'Firm RP', '39', 'British (RP)', 'hype', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('uk_m_05', 'George Sinclair', 'Deep host', '40', 'British (RP)', 'deadpan', 'male', 'en_GB-alan-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('uk_m_06', 'Edward Rowe', 'News male', '41', 'British (RP)', 'character', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('uk_m_07', 'Arthur Pembroke', 'Warm RP', '42', 'British (RP)', 'whisper', 'male', 'en_GB-alan-medium', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('uk_m_08', 'Charles Thornton', 'Studio British', '43', 'British (RP)', 'vocal_smile', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('uk_c_01', 'Maisie Croft', 'UK youth', '11', 'British (RP)', 'hype', 'children', 'en_GB-alba-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('uk_c_02', 'Poppy Hartley', 'Bright UK kid', '12', 'British (RP)', 'vocal_smile', 'children', 'en_GB-cori-high', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('uk_c_03', 'Lily Sinclair', 'Soft UK kid', '13', 'British (RP)', 'empathetic', 'children', 'en_GB-semaine-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('uk_c_04', 'Daisy Langley', 'Playful UK', '14', 'British (RP)', 'hype', 'children', 'en_GB-alba-medium', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('uk_c_05', 'Rosie Pembroke', 'Clear UK youth', '15', 'British (RP)', 'vocal_smile', 'children', 'en_GB-cori-high', { lengthScale: 0.96, noiseScale: 0.8 }),
  slot('uk_c_06', 'Ellie Rowe', 'Host youth', '16', 'British (RP)', 'empathetic', 'children', 'en_GB-semaine-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('uk_o_01', 'Margaret Whitmore', 'BBC elder', '58', 'British (RP)', 'empathetic', 'old', 'en_GB-alan-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('uk_o_02', 'Harold Croft', 'Deep elder', '59', 'British (RP)', 'newscaster', 'old', 'en_GB-northern_english_male-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('uk_o_03', 'Evelyn Hartley', 'Warm elder', '60', 'British (RP)', 'deadpan', 'old', 'en_GB-alba-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('uk_o_04', 'Reginald Sinclair', 'Classic elder', '61', 'British (RP)', 'empathetic', 'old', 'en_GB-cori-high', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('uk_o_05', 'Dorothy Langley', 'Soft elder', '62', 'British (RP)', 'newscaster', 'old', 'en_GB-semaine-medium', { lengthScale: 1.22, noiseScale: 0.5 }),
  slot('uk_o_06', 'Alfred Rowe', 'Steady elder', '63', 'British (RP)', 'deadpan', 'old', 'en_GB-alan-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('ukb_f_01', 'Isla Bright', 'UK street bright', '26', 'British (Brixton)', 'vocal_smile', 'female', 'en_GB-cori-high', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('ukb_f_02', 'Tia Morgan', 'Urban UK host', '27', 'British (Brixton)', 'newscaster', 'female', 'en_GB-semaine-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('ukb_f_03', 'Jade Coleman', 'Street energy', '28', 'British (Brixton)', 'empathetic', 'female', 'en_GB-alba-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('ukb_f_04', 'Nia Brooks', 'Bold UK lead', '29', 'British (Brixton)', 'hype', 'female', 'en_GB-cori-high', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('ukb_f_05', 'Keisha Reed', 'Bright Brixton', '30', 'British (Brixton)', 'deadpan', 'female', 'en_GB-semaine-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('ukb_f_06', 'Aaliyah Cole', 'Warm urban', '31', 'British (Brixton)', 'character', 'female', 'en_GB-alba-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('ukb_m_01', 'Atlas Ryan', 'UK narrator', '34', 'British (Brixton)', 'vocal_smile', 'male', 'en_GB-alan-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('ukb_m_02', 'Jordan Blake', 'Urban male', '35', 'British (Brixton)', 'newscaster', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('ukb_m_03', 'Marcus Cole', 'Street depth', '36', 'British (Brixton)', 'empathetic', 'male', 'en_GB-alan-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('ukb_m_04', 'Devon Reed', 'Bold host', '37', 'British (Brixton)', 'hype', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('ukb_m_05', 'Kai Morgan', 'Bright urban', '38', 'British (Brixton)', 'deadpan', 'male', 'en_GB-alan-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('ukb_m_06', 'Leon Brooks', 'Steady urban', '39', 'British (Brixton)', 'character', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('ukb_c_01', 'Tia Spark', 'Urban youth', '11', 'British (Brixton)', 'hype', 'children', 'en_GB-cori-high', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('ukb_c_02', 'Nia Pop', 'Bright kid', '12', 'British (Brixton)', 'vocal_smile', 'children', 'en_GB-semaine-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('ukb_c_03', 'Jade Tiny', 'Playful urban', '13', 'British (Brixton)', 'hype', 'children', 'en_GB-cori-high', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('ukb_c_04', 'Isla Kid', 'Street youth', '14', 'British (Brixton)', 'vocal_smile', 'children', 'en_GB-semaine-medium', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('ukb_o_01', 'Winston Cole', 'Urban elder', '58', 'British (Brixton)', 'deadpan', 'old', 'en_GB-alan-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('ukb_o_02', 'Gloria Reed', 'Warm elder', '59', 'British (Brixton)', 'empathetic', 'old', 'en_GB-northern_english_male-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('ukb_o_03', 'Clarence Brooks', 'Deep elder', '60', 'British (Brixton)', 'deadpan', 'old', 'en_GB-alba-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('ukb_o_04', 'Pearl Morgan', 'Soft elder', '61', 'British (Brixton)', 'empathetic', 'old', 'en_GB-alan-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('in_f_01', 'Priya Sharma', 'Warm IN host', '27', 'Indian English', 'vocal_smile', 'female', 'en_IN-spicor-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('in_f_02', 'Ananya Iyer', 'Clear IN lead', '28', 'Indian English', 'newscaster', 'female', 'en_IN-spicor-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('in_f_03', 'Kavya Reddy', 'Bright IN energy', '29', 'Indian English', 'empathetic', 'female', 'en_IN-spicor-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('in_f_04', 'Meera Kapoor', 'Soft IN invite', '30', 'Indian English', 'hype', 'female', 'en_IN-spicor-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('in_f_05', 'Sneha Joshi', 'News IN host', '31', 'Indian English', 'deadpan', 'female', 'en_IN-spicor-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('in_f_06', 'Divya Nair', 'Polished IN', '32', 'Indian English', 'character', 'female', 'en_IN-spicor-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('in_f_07', 'Aisha Khan', 'Friendly IN', '33', 'Indian English', 'whisper', 'female', 'en_IN-spicor-medium', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('in_f_08', 'Pooja Desai', 'Studio IN', '34', 'Indian English', 'vocal_smile', 'female', 'en_IN-spicor-medium', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('in_f_09', 'Riya Malhotra', 'Upbeat IN', '35', 'Indian English', 'newscaster', 'female', 'en_IN-spicor-medium', { lengthScale: 0.99, noiseScale: 0.65 }),
  slot('in_f_10', 'Neha Banerjee', 'Gentle IN', '36', 'Indian English', 'empathetic', 'female', 'en_IN-spicor-medium', { lengthScale: 1.01, noiseScale: 0.6900000000000001 }),
  slot('in_m_01', 'Arjun Mehta', 'IN male lead', '33', 'Indian English', 'vocal_smile', 'male', 'en_IN-spicor-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('in_m_02', 'Rohan Patel', 'Clear IN host', '34', 'Indian English', 'newscaster', 'male', 'en_IN-spicor-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('in_m_03', 'Vikram Singh', 'Deep IN narrator', '35', 'Indian English', 'empathetic', 'male', 'en_IN-spicor-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('in_m_04', 'Aditya Rao', 'Firm IN lead', '36', 'Indian English', 'hype', 'male', 'en_IN-spicor-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('in_m_05', 'Kabir Malhotra', 'Warm IN', '37', 'Indian English', 'deadpan', 'male', 'en_IN-spicor-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('in_m_06', 'Nikhil Gupta', 'News IN male', '38', 'Indian English', 'character', 'male', 'en_IN-spicor-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('in_m_07', 'Sameer Khan', 'Bright IN', '39', 'Indian English', 'whisper', 'male', 'en_IN-spicor-medium', { lengthScale: 0.95, noiseScale: 0.73 }),
  slot('in_m_08', 'Rajesh Iyer', 'Studio IN', '40', 'Indian English', 'vocal_smile', 'male', 'en_IN-spicor-medium', { lengthScale: 0.97, noiseScale: 0.77 }),
  slot('in_m_09', 'Aman Sharma', 'Steady IN', '41', 'Indian English', 'newscaster', 'male', 'en_IN-spicor-medium', { lengthScale: 0.99, noiseScale: 0.65 }),
  slot('in_m_10', 'Karan Desai', 'Bass IN', '42', 'Indian English', 'empathetic', 'male', 'en_IN-spicor-medium', { lengthScale: 1.01, noiseScale: 0.6900000000000001 }),
  slot('in_c_01', 'Aarohi Sharma', 'Soft IN youth', '11', 'Indian English', 'hype', 'children', 'en_IN-spicor-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('in_c_02', 'Anvi Patel', 'Bright IN kid', '12', 'Indian English', 'vocal_smile', 'children', 'en_IN-spicor-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('in_c_03', 'Myra Reddy', 'Playful IN', '13', 'Indian English', 'character', 'children', 'en_IN-spicor-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('in_c_04', 'Kiara Nair', 'Sunny IN youth', '14', 'Indian English', 'hype', 'children', 'en_IN-spicor-medium', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('in_c_05', 'Sara Kapoor', 'Clear IN kid', '15', 'Indian English', 'vocal_smile', 'children', 'en_IN-spicor-medium', { lengthScale: 0.96, noiseScale: 0.8 }),
  slot('in_c_06', 'Diya Joshi', 'Host youth IN', '16', 'Indian English', 'character', 'children', 'en_IN-spicor-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('in_o_01', 'Suresh Mehta', 'Deep IN elder', '58', 'Indian English', 'deadpan', 'old', 'en_IN-spicor-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('in_o_02', 'Lakshmi Iyer', 'Warm IN elder', '59', 'Indian English', 'empathetic', 'old', 'en_IN-spicor-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('in_o_03', 'Ramesh Patel', 'Steady IN elder', '60', 'Indian English', 'newscaster', 'old', 'en_IN-spicor-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('in_o_04', 'Sunita Reddy', 'Soft IN elder', '61', 'Indian English', 'deadpan', 'old', 'en_IN-spicor-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('in_o_05', 'Madhur Singh', 'Bass IN elder', '62', 'Indian English', 'empathetic', 'old', 'en_IN-spicor-medium', { lengthScale: 1.22, noiseScale: 0.5 }),
  slot('in_o_06', 'Kamala Rao', 'Story IN elder', '63', 'Indian English', 'newscaster', 'old', 'en_IN-spicor-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('au_f_01', 'Harper Hayes', 'Aussie host', '28', 'Australian', 'vocal_smile', 'female', 'en_US-amy-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('au_f_02', 'Chloe Bennett', 'Bright Aussie', '29', 'Australian', 'newscaster', 'female', 'en_GB-cori-high', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('au_f_03', 'Matilda Crowe', 'Warm AU', '30', 'Australian', 'empathetic', 'female', 'en_US-ljspeech-high', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('au_f_04', 'Isla Murray', 'Clear AU', '31', 'Australian', 'hype', 'female', 'en_US-amy-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('au_f_05', 'Zoe Sullivan', 'Upbeat AU', '32', 'Australian', 'deadpan', 'female', 'en_GB-cori-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('au_f_06', 'Ruby Nash', 'Friendly AU', '33', 'Australian', 'character', 'female', 'en_US-ljspeech-high', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('au_m_01', 'Blake Reid', 'Aussie depth', '34', 'Australian', 'vocal_smile', 'male', 'en_US-ryan-high', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('au_m_02', 'Jack Murray', 'AU male lead', '35', 'Australian', 'newscaster', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('au_m_03', 'Liam Crowe', 'Clear AU', '36', 'Australian', 'empathetic', 'male', 'en_US-joe-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('au_m_04', 'Noah Sullivan', 'Warm AU', '37', 'Australian', 'hype', 'male', 'en_US-ryan-high', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('au_m_05', 'Ethan Nash', 'Steady AU', '38', 'Australian', 'deadpan', 'male', 'en_GB-northern_english_male-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('au_m_06', 'Harvey Blake', 'Deep AU', '39', 'Australian', 'character', 'male', 'en_US-joe-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('au_c_01', 'Molly Kiwi', 'AU youth', '11', 'Australian', 'vocal_smile', 'children', 'en_US-ljspeech-high', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('au_c_02', 'Billie Nash', 'Bright AU kid', '12', 'Australian', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('au_c_03', 'Pippa Crowe', 'Soft AU kid', '13', 'Australian', 'vocal_smile', 'children', 'en_US-ljspeech-high', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('au_c_04', 'Tilly Murray', 'Playful AU', '14', 'Australian', 'hype', 'children', 'en_US-amy-medium', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('au_o_01', 'Bruce Murray', 'AU elder', '58', 'Australian', 'empathetic', 'old', 'en_US-joe-medium', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('au_o_02', 'Helen Crowe', 'Warm AU elder', '59', 'Australian', 'deadpan', 'old', 'en_US-danny-low', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('au_o_03', 'Craig Nash', 'Deep AU elder', '60', 'Australian', 'empathetic', 'old', 'en_US-amy-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('au_o_04', 'Judy Sullivan', 'Soft AU elder', '61', 'Australian', 'deadpan', 'old', 'en_US-joe-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('ta_f_01', 'Victoria Lang', 'Classic polish', '34', 'Transatlantic', 'vocal_smile', 'female', 'en_US-kristin-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('ta_f_02', 'Catherine Vale', 'Cinema host', '35', 'Transatlantic', 'newscaster', 'female', 'en_GB-alba-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('ta_f_03', 'Eleanor Frost', 'Warm classic', '36', 'Transatlantic', 'empathetic', 'female', 'en_US-lessac-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('ta_f_04', 'Genevieve Moore', 'Studio polish', '37', 'Transatlantic', 'hype', 'female', 'en_US-kristin-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('ta_f_05', 'Beatrice Quinn', 'Soft classic', '38', 'Transatlantic', 'deadpan', 'female', 'en_GB-alba-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('ta_f_06', 'Lillian Cross', 'Clear classic', '39', 'Transatlantic', 'character', 'female', 'en_US-lessac-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('ta_m_01', 'Marcus Vale', 'Bass authority', '42', 'Transatlantic', 'vocal_smile', 'male', 'en_US-hfc_male-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('ta_m_02', 'Sebastian Cross', 'Classic male', '43', 'Transatlantic', 'newscaster', 'male', 'en_GB-alan-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('ta_m_03', 'Julian Frost', 'Deep polish', '44', 'Transatlantic', 'empathetic', 'male', 'en_US-danny-low', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('ta_m_04', 'Frederick Moore', 'Warm classic', '45', 'Transatlantic', 'hype', 'male', 'en_US-hfc_male-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('ta_m_05', 'Theodore Quinn', 'Studio classic', '46', 'Transatlantic', 'deadpan', 'male', 'en_GB-alan-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('ta_m_06', 'Vincent Lang', 'Firm classic', '47', 'Transatlantic', 'character', 'male', 'en_US-danny-low', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('ta_c_01', 'Clara Vale', 'Classic youth', '11', 'Transatlantic', 'vocal_smile', 'children', 'en_US-amy-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('ta_c_02', 'Felix Quinn', 'Bright classic kid', '12', 'Transatlantic', 'hype', 'children', 'en_GB-cori-high', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('ta_c_03', 'Iris Frost', 'Soft classic kid', '13', 'Transatlantic', 'vocal_smile', 'children', 'en_US-amy-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('ta_c_04', 'Hugo Moore', 'Playful classic', '14', 'Transatlantic', 'hype', 'children', 'en_GB-cori-high', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('ta_o_01', 'Steffan Deep', 'Deep storyteller', '58', 'Transatlantic', 'empathetic', 'old', 'en_US-danny-low', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('ta_o_02', 'Helena Vale', 'Warm classic elder', '59', 'Transatlantic', 'deadpan', 'old', 'en_US-lessac-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('ta_o_03', 'Conrad Frost', 'Bass classic elder', '60', 'Transatlantic', 'empathetic', 'old', 'en_GB-alan-medium', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('ta_o_04', 'Lillian Elder', 'Soft classic elder', '61', 'Transatlantic', 'deadpan', 'old', 'en_US-danny-low', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('neu_f_01', 'Clara North', 'Neutral clear', '30', 'Neutral', 'vocal_smile', 'female', 'en_US-lessac-medium', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('neu_f_02', 'Elena Frost', 'Clean host', '31', 'Neutral', 'newscaster', 'female', 'en_US-amy-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('neu_f_03', 'Nadia Cole', 'Studio neutral', '32', 'Neutral', 'empathetic', 'female', 'en_US-kristin-medium', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('neu_f_04', 'Irene Blake', 'Soft clear', '33', 'Neutral', 'hype', 'female', 'en_US-ljspeech-high', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('neu_f_05', 'Paula Reed', 'News clear', '34', 'Neutral', 'deadpan', 'female', 'en_US-hfc_female-medium', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('neu_f_06', 'Nina Hart', 'Warm clear', '35', 'Neutral', 'character', 'female', 'en_US-lessac-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('neu_m_01', 'Daniel North', 'Neutral male', '34', 'Neutral', 'vocal_smile', 'male', 'en_US-ryan-high', { lengthScale: 0.95, noiseScale: 0.65 }),
  slot('neu_m_02', 'Chris Vale', 'Clear male', '35', 'Neutral', 'newscaster', 'male', 'en_US-joe-medium', { lengthScale: 0.97, noiseScale: 0.6900000000000001 }),
  slot('neu_m_03', 'Adam Cole', 'Studio male', '36', 'Neutral', 'empathetic', 'male', 'en_US-danny-low', { lengthScale: 0.99, noiseScale: 0.73 }),
  slot('neu_m_04', 'Ben Hart', 'Steady male', '37', 'Neutral', 'hype', 'male', 'en_US-hfc_male-medium', { lengthScale: 1.01, noiseScale: 0.77 }),
  slot('neu_m_05', 'Luke Reed', 'Deep clear', '38', 'Neutral', 'deadpan', 'male', 'en_US-ryan-high', { lengthScale: 1.03, noiseScale: 0.65 }),
  slot('neu_m_06', 'Sam Blake', 'Warm male', '39', 'Neutral', 'character', 'male', 'en_US-joe-medium', { lengthScale: 1.05, noiseScale: 0.6900000000000001 }),
  slot('neu_c_01', 'Luna Pop', 'Bright youth', '11', 'Neutral', 'hype', 'children', 'en_US-lessac-medium', { lengthScale: 0.88, noiseScale: 0.8 }),
  slot('neu_c_02', 'Ellie Beam', 'Soft youth', '12', 'Neutral', 'vocal_smile', 'children', 'en_US-amy-medium', { lengthScale: 0.9, noiseScale: 0.8 }),
  slot('neu_c_03', 'Max Spark', 'Playful youth', '13', 'Neutral', 'hype', 'children', 'en_US-kristin-medium', { lengthScale: 0.92, noiseScale: 0.8 }),
  slot('neu_c_04', 'Nora Lite', 'Clear youth', '14', 'Neutral', 'vocal_smile', 'children', 'en_US-ljspeech-high', { lengthScale: 0.94, noiseScale: 0.8 }),
  slot('neu_o_01', 'Joe Elder', 'Steady elder', '58', 'Neutral', 'newscaster', 'old', 'en_US-ryan-high', { lengthScale: 1.14, noiseScale: 0.5 }),
  slot('neu_o_02', 'Helen Clear', 'Warm elder', '59', 'Neutral', 'empathetic', 'old', 'en_US-joe-medium', { lengthScale: 1.16, noiseScale: 0.5 }),
  slot('neu_o_03', 'Frank Vale', 'Deep elder', '60', 'Neutral', 'newscaster', 'old', 'en_US-danny-low', { lengthScale: 1.18, noiseScale: 0.5 }),
  slot('neu_o_04', 'Ruth North', 'Soft elder', '61', 'Neutral', 'empathetic', 'old', 'en_US-hfc_male-medium', { lengthScale: 1.2, noiseScale: 0.5 }),
  slot('adv_clone_a', 'Clone Slot A', 'Your reference', '—', 'Custom', 'character', 'custom', 'en_US-ryan-high', { lengthScale: null, noiseScale: null }),
  slot('adv_clone_b', 'Clone Slot B', 'Brand reference', '—', 'Custom', 'vocal_smile', 'custom', 'en_US-lessac-medium', { lengthScale: null, noiseScale: null }),
  slot('adv_clone_c', 'Clone Slot C', 'Alt reference', '—', 'Custom', 'empathetic', 'custom', 'en_US-amy-medium', { lengthScale: null, noiseScale: null })
].map((v) => ({ ...v, clone: v.type === 'custom', edgeSpeaker: v.localVoice, speaker: v.localVoice }));

const EMOTION_PROSODY = {
  vocal_smile: { rate: 1.1, pitch: 1.14 },
  newscaster: { rate: 1.02, pitch: 0.96 },
  whisper: { rate: 0.68, pitch: 1.1 },
  empathetic: { rate: 0.8, pitch: 0.92 },
  hype: { rate: 1.28, pitch: 1.16 },
  deadpan: { rate: 0.86, pitch: 0.82 },
  character: { rate: 1.08, pitch: 1.22 },
};

const TYPE_PROSODY_BIAS = {
  female: { rateMul: 1, pitchMul: 1 },
  male: { rateMul: 1, pitchMul: 0.98 },
  children: { rateMul: 1.06, pitchMul: 1.22 },
  old: { rateMul: 0.88, pitchMul: 0.84 },
  custom: { rateMul: 1, pitchMul: 1 },
};

const PACE_PRESETS = {
  natural: { id: 'natural', label: 'Natural', desc: 'Natural conversational pace.', rateMul: 1, transform: 'none' },
  rapid_fire: { id: 'rapid_fire', label: 'Rapid Fire', desc: 'Fast, energetic, no dead air.', rateMul: 1.32, transform: 'rapid' },
  the_drift: { id: 'the_drift', label: 'The Drift', desc: 'Slow, liquid, zero urgency. Long pauses.', rateMul: 0.68, transform: 'drift' },
  staccato: { id: 'staccato', label: 'Staccato', desc: 'Short, clipped sentences with pauses.', rateMul: 0.92, transform: 'staccato' },
};

const ACCENT_EDGE_FALLBACK = {
  Neutral: { male: 'en_US-joe-medium', female: 'en_US-lessac-medium', children: 'en_US-amy-medium', old: 'en_US-danny-low', custom: 'en_US-ryan-high' },
  'American (Gen)': { male: 'en_US-ryan-high', female: 'en_US-lessac-medium', children: 'en_US-amy-medium', old: 'en_US-danny-low', custom: 'en_US-ryan-high' },
  'American (Valley)': { male: 'en_US-joe-medium', female: 'en_US-amy-medium', children: 'en_US-ljspeech-high', old: 'en_US-hfc_male-medium', custom: 'en_US-amy-medium' },
  'American (South)': { male: 'en_US-danny-low', female: 'en_US-hfc_female-medium', children: 'en_US-kristin-medium', old: 'en_US-danny-low', custom: 'en_US-danny-low' },
  'British (RP)': { male: 'en_GB-alan-medium', female: 'en_GB-alba-medium', children: 'en_GB-cori-high', old: 'en_GB-alan-medium', custom: 'en_GB-alba-medium' },
  'British (Brixton)': { male: 'en_GB-northern_english_male-medium', female: 'en_GB-cori-high', children: 'en_GB-cori-high', old: 'en_GB-northern_english_male-medium', custom: 'en_GB-cori-high' },
  Transatlantic: { male: 'en_US-hfc_male-medium', female: 'en_US-kristin-medium', children: 'en_US-amy-medium', old: 'en_US-danny-low', custom: 'en_US-lessac-medium' },
  Australian: { male: 'en_US-ryan-high', female: 'en_US-amy-medium', children: 'en_US-ljspeech-high', old: 'en_US-joe-medium', custom: 'en_US-amy-medium' },
  // Real Indian English neural (SPICOR) — not US FX, not Hindi
  'Indian English': { male: 'en_IN-spicor-medium', female: 'en_IN-spicor-medium', children: 'en_IN-spicor-medium', old: 'en_IN-spicor-medium', custom: 'en_IN-spicor-medium' },
  Custom: { male: 'en_US-ryan-high', female: 'en_US-lessac-medium', children: 'en_US-amy-medium', old: 'en_US-danny-low', custom: 'en_US-ryan-high' },
};

/** Per-accent voice pools — UI accent rematches every character into this dialect */
const ACCENT_VOICE_POOLS = {
  Neutral: {
    female: ['en_US-lessac-medium', 'en_US-amy-medium', 'en_US-kristin-medium', 'en_US-ljspeech-high', 'en_US-hfc_female-medium'],
    male: ['en_US-ryan-high', 'en_US-joe-medium', 'en_US-danny-low', 'en_US-hfc_male-medium'],
    children: ['en_US-amy-medium', 'en_US-ljspeech-high', 'en_US-lessac-medium', 'en_US-kristin-medium'],
    old: ['en_US-danny-low', 'en_US-hfc_male-medium', 'en_US-joe-medium', 'en_US-lessac-medium'],
    custom: ['en_US-ryan-high', 'en_US-lessac-medium'],
  },
  'American (Gen)': {
    female: ['en_US-lessac-medium', 'en_US-kristin-medium', 'en_US-hfc_female-medium', 'en_US-amy-medium'],
    male: ['en_US-ryan-high', 'en_US-joe-medium', 'en_US-hfc_male-medium', 'en_US-danny-low'],
    children: ['en_US-amy-medium', 'en_US-ljspeech-high', 'en_US-lessac-medium'],
    old: ['en_US-danny-low', 'en_US-joe-medium', 'en_US-hfc_male-medium'],
    custom: ['en_US-ryan-high', 'en_US-lessac-medium'],
  },
  'American (Valley)': {
    female: ['en_US-amy-medium', 'en_US-ljspeech-high', 'en_US-kristin-medium', 'en_US-lessac-medium'],
    male: ['en_US-joe-medium', 'en_US-ryan-high', 'en_US-hfc_male-medium'],
    children: ['en_US-amy-medium', 'en_US-ljspeech-high', 'en_US-kristin-medium'],
    old: ['en_US-hfc_male-medium', 'en_US-danny-low', 'en_US-joe-medium'],
    custom: ['en_US-amy-medium'],
  },
  'American (South)': {
    female: ['en_US-hfc_female-medium', 'en_US-lessac-medium', 'en_US-kristin-medium'],
    male: ['en_US-danny-low', 'en_US-hfc_male-medium', 'en_US-joe-medium'],
    children: ['en_US-kristin-medium', 'en_US-amy-medium', 'en_US-hfc_female-medium'],
    old: ['en_US-danny-low', 'en_US-hfc_male-medium'],
    custom: ['en_US-danny-low'],
  },
  'British (RP)': {
    female: ['en_GB-alba-medium', 'en_GB-cori-high', 'en_GB-semaine-medium'],
    male: ['en_GB-alan-medium', 'en_GB-northern_english_male-medium'],
    children: ['en_GB-cori-high', 'en_GB-alba-medium', 'en_GB-semaine-medium'],
    old: ['en_GB-alan-medium', 'en_GB-northern_english_male-medium', 'en_GB-alba-medium'],
    custom: ['en_GB-alba-medium'],
  },
  'British (Brixton)': {
    female: ['en_GB-cori-high', 'en_GB-semaine-medium', 'en_GB-alba-medium'],
    male: ['en_GB-northern_english_male-medium', 'en_GB-alan-medium'],
    children: ['en_GB-cori-high', 'en_GB-semaine-medium'],
    old: ['en_GB-northern_english_male-medium', 'en_GB-alan-medium'],
    custom: ['en_GB-cori-high'],
  },
  Transatlantic: {
    female: ['en_US-kristin-medium', 'en_GB-alba-medium', 'en_US-lessac-medium'],
    male: ['en_US-hfc_male-medium', 'en_GB-alan-medium', 'en_US-danny-low'],
    children: ['en_US-amy-medium', 'en_GB-cori-high'],
    old: ['en_US-danny-low', 'en_GB-alan-medium'],
    custom: ['en_US-lessac-medium'],
  },
  Australian: {
    female: ['en_US-amy-medium', 'en_GB-cori-high', 'en_US-ljspeech-high'],
    male: ['en_US-ryan-high', 'en_GB-northern_english_male-medium', 'en_US-joe-medium'],
    children: ['en_US-ljspeech-high', 'en_US-amy-medium', 'en_GB-cori-high'],
    old: ['en_US-joe-medium', 'en_US-danny-low'],
    custom: ['en_US-amy-medium'],
  },
  'Indian English': {
    female: ['en_IN-spicor-medium'],
    male: ['en_IN-spicor-medium'],
    children: ['en_IN-spicor-medium'],
    old: ['en_IN-spicor-medium'],
    custom: ['en_IN-spicor-medium'],
  },
  Custom: {
    female: ['en_US-lessac-medium'],
    male: ['en_US-ryan-high'],
    children: ['en_US-amy-medium'],
    old: ['en_US-danny-low'],
    custom: ['en_US-ryan-high', 'en_US-lessac-medium'],
  },
};

const ACCENT_ESPEAK = {
  Neutral: 'en-us',
  'American (Gen)': 'en-us',
  'American (Valley)': 'en-US-nyc',
  'American (South)': 'en-us',
  'British (RP)': 'en-gb-x-rp',
  'British (Brixton)': 'en-GB-scotland',
  Transatlantic: 'en-us',
  Australian: 'en-029',
  'Indian English': 'en-us',
  Custom: 'en-us',
};

const ACCENT_FX_BIAS = {
  Neutral: { treble: 0.6, bass: 0.3, tempo: 1, formant: 1, air: 0 },
  'American (Gen)': { treble: 1.0, bass: 0.4, tempo: 1.03, formant: 1, air: 0.2 },
  'American (Valley)': { treble: 2.2, bass: -0.4, tempo: 1.07, formant: 1.04, air: 0.5 },
  'American (South)': { treble: 0.2, bass: 2.2, tempo: 0.93, formant: 0.97, air: 0.1 },
  'British (RP)': { treble: 0.9, bass: 0.8, tempo: 0.96, formant: 0.98, air: 0.35 },
  'British (Brixton)': { treble: 1.6, bass: 0.4, tempo: 1.05, formant: 1.02, air: 0.4 },
  Transatlantic: { treble: 0.5, bass: 1.3, tempo: 0.94, formant: 0.99, air: 0.25 },
  Australian: { treble: 1.4, bass: 0.5, tempo: 1.04, formant: 1.03, air: 0.45 },
  // Light polish only — accent comes from en_IN-spicor neural, not EQ theater
  'Indian English': { treble: 0.6, bass: 0.5, tempo: 0.97, formant: 1.0, air: 0.15, syllable: true },
  Custom: { treble: 0.8, bass: 0.8, tempo: 1, formant: 1, air: 0.2 },
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hashStr(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function speakerForAccentType(accent, voiceType) {
  const byAccent = ACCENT_EDGE_FALLBACK[accent] || ACCENT_EDGE_FALLBACK['American (Gen)'];
  const typeKey = voiceType || 'female';
  return byAccent?.[typeKey] || byAccent?.female || 'en_US-lessac-medium';
}

/** Pick a stable voice from the accent pool so each character stays unique within dialect */
function rematchLocalVoice(accent, voiceType, voiceId, nativeVoice) {
  const accentKey = accent || 'American (Gen)';
  const typeKey = voiceType || 'female';
  const pool = ACCENT_VOICE_POOLS[accentKey]?.[typeKey] || ACCENT_VOICE_POOLS[accentKey]?.female;
  if (!pool || !pool.length) return nativeVoice || speakerForAccentType(accentKey, typeKey);

  // If native voice already belongs to this accent pool, keep it (true dialect characters)
  if (nativeVoice && pool.includes(nativeVoice)) return nativeVoice;

  // Neutral keeps native Piper assignment
  if (accentKey === 'Neutral' && nativeVoice) return nativeVoice;

  const idx = hashStr(`${voiceId}|${accentKey}|${typeKey}`) % pool.length;
  return pool[idx];
}

function accentEspeakVoice(accent) {
  return ACCENT_ESPEAK[accent] || 'en-us';
}

function applyPaceTransform(text, paceId) {
  const t = String(text || '').trim();
  if (!t) return t;
  const pace = PACE_PRESETS[paceId] || PACE_PRESETS.natural;
  if (pace.transform === 'rapid') {
    return t.replace(/\s+/g, ' ').replace(/\.\s+/g, '. ').replace(/,\s+/g, ', ');
  }
  if (pace.transform === 'drift') {
    return t
      .replace(/([.!?])\s+/g, '$1 ... ')
      .replace(/,\s+/g, ',  ')
      .replace(/\s+/g, ' ');
  }
  if (pace.transform === 'staccato') {
    const words = t.replace(/[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
    if (words.length <= 1) return t;
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('. ') + '.';
  }
  return t;
}

/**
 * Indian English rhythm: slightly more syllable-timed (short pauses),
 * without mangling spelling into fake phonetics.
 */
function applyAccentTextTransform(text, accent) {
  let t = String(text || '').trim();
  if (!t) return t;
  if (accent === 'Indian English') {
    // Gentle breath commas after clause markers — keeps en_IN cadence natural
    t = t
      .replace(/\s+/g, ' ')
      .replace(/([,;:])\s*/g, '$1 ')
      .replace(/([.!?])\s+/g, '$1 ')
      .replace(/\b(and|but|so|because|which|that)\b/gi, ' $1');
    return t.replace(/\s+/g, ' ').trim();
  }
  return t;
}

/**
 * UI accent always wins — rematch Piper dialect so Indian/British/American actually change.
 */
function resolveAdvancedVoice({ voiceId, voiceType, accent }) {
  const typeKey = voiceType || 'female';
  const accentKey = accent || 'American (Gen)';
  const lib = ADVANCED_VOICE_LIBRARY.find((v) => v.id === voiceId || v.name === voiceId);

  if (lib) {
    const native = lib.localVoice || lib.edgeSpeaker;
    // Voice already belongs to this accent cast → keep its engine (Indian name = Indic voice)
    const sameAccent = lib.clone ? accentKey === 'Custom' : lib.accent === accentKey;
    const speaker = sameAccent
      ? native
      : rematchLocalVoice(accentKey, lib.type || typeKey, lib.id, native);
    const rematched = speaker !== native;
    return {
      ...lib,
      accent: lib.clone ? 'Custom' : accentKey,
      type: lib.type || typeKey,
      localVoice: speaker,
      edgeSpeaker: speaker,
      speaker,
      espeakVoice: accentEspeakVoice(lib.clone ? 'Custom' : accentKey),
      rematched,
      nativeVoice: native,
    };
  }

  const speaker = speakerForAccentType(accentKey, typeKey);
  return {
    id: voiceId || 'adv_fallback',
    name: voiceId || 'Advanced Voice',
    type: typeKey,
    accent: accentKey,
    localVoice: speaker,
    edgeSpeaker: speaker,
    speaker,
    espeakVoice: accentEspeakVoice(accentKey),
    rematched: true,
  };
}

function mapAdvancedProsody(opts = {}) {
  const emotion = EMOTION_PROSODY[opts.emotion] || EMOTION_PROSODY.vocal_smile;
  const pace = PACE_PRESETS[opts.paceId] || PACE_PRESETS.natural;
  const typeBias = TYPE_PROSODY_BIAS[opts.voiceType] || TYPE_PROSODY_BIAS.female;
  const speed = Number.isFinite(opts.speed) ? opts.speed : 1;
  const pitchCtrl = Number.isFinite(opts.pitch) ? opts.pitch : 1.08;
  const emotionAmt = Number.isFinite(opts.emotionAmt) ? opts.emotionAmt : 0.82;
  const stability = Number.isFinite(opts.stability) ? opts.stability : 0.45;

  const eRate = 1 + (emotion.rate - 1) * emotionAmt;
  const ePitch = 1 + (emotion.pitch - 1) * emotionAmt;
  const stab = clamp(stability, 0, 1);

  const bias = ACCENT_FX_BIAS[opts.accent] || ACCENT_FX_BIAS['American (Gen)'];
  let rate = eRate * speed * (pace.rateMul || 1) * (bias.tempo || 1) * (typeBias.rateMul || 1);
  let pitch = 1 + (ePitch * pitchCtrl * (typeBias.pitchMul || 1) - 1) * (0.75 + 0.25 * (1 - stab));

  rate = clamp(rate, 0.48, 1.95);
  pitch = clamp(pitch, 0.48, 1.9);

  let volume = 1.08;
  if (opts.emotion === 'whisper') volume = 0.55;
  if (opts.emotion === 'hype') volume = 1.25;
  if (opts.emotion === 'deadpan') volume = 0.92;
  if (opts.emotion === 'newscaster') volume = 1.1;

  return { rate, pitch, volume, accentBias: bias, paceId: pace.id };
}

function listAdvancedVoices() {
  return ADVANCED_VOICE_LIBRARY.map((v) => ({
    id: v.id,
    name: v.name,
    personality: v.personality,
    age: v.age,
    accent: v.accent,
    emotion: v.emotion,
    type: v.type,
    clone: !!v.clone,
    localVoice: v.localVoice,
    edgeSpeaker: v.localVoice,
    engine: 'piper-local',
  }));
}

module.exports = {
  ADVANCED_VOICE_LIBRARY,
  PIPER_FEMALE,
  PIPER_MALE,
  EMOTION_PROSODY,
  TYPE_PROSODY_BIAS,
  PACE_PRESETS,
  ACCENT_EDGE_FALLBACK,
  ACCENT_VOICE_POOLS,
  ACCENT_ESPEAK,
  ACCENT_FX_BIAS,
  resolveAdvancedVoice,
  mapAdvancedProsody,
  listAdvancedVoices,
  applyPaceTransform,
  applyAccentTextTransform,
  speakerForAccentType,
  rematchLocalVoice,
  accentEspeakVoice,
};
