// Text Rendering and Styling Presets
// Automation: Preset applies automatically; custom settings override preset

// 4.1 Kinetic Effects (50+)
export const KINETIC_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'scalePop', label: 'Scale Pop' },
  { id: 'scaleBounce', label: 'Scale Bounce' },
  { id: 'rotateIn', label: 'Rotate In' },
  { id: 'rotateBounce', label: 'Rotate Bounce' },
  { id: 'fadeIn', label: 'Fade In' },
  { id: 'fadeSlide', label: 'Fade + Slide' },
  { id: 'slideFromTop', label: 'Slide From Top' },
  { id: 'slideFromBottom', label: 'Slide From Bottom' },
  { id: 'slideFromLeft', label: 'Slide From Left' },
  { id: 'slideFromRight', label: 'Slide From Right' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'blurIn', label: 'Blur In' },
  { id: 'elastic', label: 'Elastic' },
  { id: 'spring', label: 'Spring' },
  { id: 'flipX', label: 'Flip X' },
  { id: 'flipY', label: 'Flip Y' },
  { id: 'zoomIn', label: 'Zoom In' },
  { id: 'zoomOut', label: 'Zoom Out' },
  { id: 'wave', label: 'Wave' },
  { id: 'shake', label: 'Shake' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'glow', label: 'Glow' },
  { id: 'float', label: 'Float' },
  { id: 'drop', label: 'Drop' },
  { id: 'swing', label: 'Swing' },
  { id: 'bounceIn', label: 'Bounce In' },
  { id: 'rubberBand', label: 'Rubber Band' },
  { id: 'jello', label: 'Jello' },
  { id: 'wobble', label: 'Wobble' },
  { id: 'tada', label: 'Tada' },
  { id: 'heartbeat', label: 'Heartbeat' },
  { id: 'flash', label: 'Flash' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'neon', label: 'Neon' },
  { id: 'outline', label: 'Outline' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'gradientShift', label: 'Gradient Shift' },
  { id: 'colorPop', label: 'Color Pop' },
  { id: 'letterSpacing', label: 'Letter Spacing' },
  { id: 'underline', label: 'Underline' },
  { id: 'strikethrough', label: 'Strikethrough' },
  { id: 'doubleLine', label: 'Double Line' },
  { id: 'dotPattern', label: 'Dot Pattern' },
  { id: 'lineReveal', label: 'Line Reveal' },
  { id: 'maskReveal', label: 'Mask Reveal' },
  { id: 'splitReveal', label: 'Split Reveal' },
  { id: 'curtain', label: 'Curtain' },
  { id: 'explode', label: 'Explode' },
  { id: 'implode', label: 'Implode' },
  { id: 'scatter', label: 'Scatter' },
  { id: 'assemble', label: 'Assemble' },
  { id: 'random', label: 'Random' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'skewIn', label: 'Skew In' },
  { id: 'skewOut', label: 'Skew Out' },
  { id: 'rollOut', label: 'Roll Out' },
  { id: 'spinIn', label: 'Spin In' },
  { id: 'pinch', label: 'Pinch' },
  { id: 'morph', label: 'Morph' },
  { id: 'squash', label: 'Squash' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'inkSpread', label: 'Ink Spread' },
  { id: 'stretch', label: 'Stretch' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'spin', label: 'Spin' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'slideFlip', label: 'Slide Flip' },
  { id: 'zoomStretch', label: 'Zoom Stretch' },
  { id: 'blurOut', label: 'Blur Out' },
  { id: 'fadeScale', label: 'Fade Scale' },
  { id: 'slideZoom', label: 'Slide Zoom' },
  { id: 'flipSlide', label: 'Flip Slide' },
  { id: 'elasticOut', label: 'Elastic Out' },
  { id: 'bounceSlide', label: 'Bounce Slide' },
];

// 4.1 Kinetic Logic Presets (50+)
export const KINETIC_LOGIC_PRESETS = [
  { id: 'oneWord', label: 'One word at a time' },
  { id: 'twoWords', label: 'Two words at a time' },
  { id: 'threeWords', label: 'Three words at a time' },
  { id: 'afterOneWord', label: 'After one word' },
  { id: 'afterTwoWords', label: 'After two words' },
  { id: 'changeEveryTwo', label: 'Change every two words' },
  { id: 'changeEveryThree', label: 'Change every three words' },
  { id: 'changeEveryFour', label: 'Change every four words' },
  { id: 'oneLine', label: 'One line at a time' },
  { id: 'twoLines', label: 'Two lines at a time' },
  { id: 'oneChar', label: 'One character at a time' },
  { id: 'twoChars', label: 'Two characters at a time' },
  { id: 'random', label: 'Random' },
  { id: 'randomWords', label: 'Random words' },
  { id: 'mixed', label: 'Mixed styles' },
  { id: 'allAtOnce', label: 'All at once' },
  { id: 'sequential', label: 'Sequential' },
  { id: 'reverseSeq', label: 'Reverse sequential' },
  { id: 'oddEven', label: 'Odd/Even alternate' },
  { id: 'firstLast', label: 'First & Last' },
  { id: 'centerOut', label: 'Center outward' },
  { id: 'edgesIn', label: 'Edges inward' },
  { id: 'zigzag', label: 'Zigzag' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'waveOrder', label: 'Wave order' },
  { id: 'stagger', label: 'Stagger' },
  { id: 'cascade', label: 'Cascade' },
  { id: 'domino', label: 'Domino' },
  { id: 'ripple', label: 'Ripple' },
  { id: 'burst', label: 'Burst' },
  { id: 'focus', label: 'Focus center' },
  { id: 'highlight', label: 'Highlight word' },
  { id: 'emphasis', label: 'Emphasis' },
  { id: 'breathing', label: 'Breathing' },
  { id: 'syncVoice', label: 'Sync with voice' },
  { id: 'syncBeat', label: 'Sync with beat' },
  { id: 'phrase', label: 'By phrase' },
  { id: 'sentence', label: 'By sentence' },
  { id: 'punctuation', label: 'By punctuation' },
  { id: 'comma', label: 'At comma' },
  { id: 'period', label: 'At period' },
  { id: 'question', label: 'At question' },
  { id: 'exclamation', label: 'At exclamation' },
  { id: 'custom', label: 'Custom' },
];

// 4.2 Fonts (200+); deduped so React <option key={font}> stays unique
const FONTS_RAW = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'Arial Black', 'Courier New', 'Palatino Linotype', 'Lucida Sans', 'Lucida Console', 'Garamond', 'Bookman', 'Brush Script MT',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro', 'Raleway', 'PT Sans', 'Ubuntu', 'Playfair Display',
  'Merriweather', 'Nunito', 'Poppins', 'Work Sans', 'Quicksand', 'Rubik', 'Inter', 'Fira Sans', 'Libre Baskerville',
  'Bebas Neue', 'Pacifico', 'Dancing Script', 'Lobster', 'Caveat', 'Amatic SC', 'Shadows Into Light', 'Great Vibes',
  'Sacramento', 'Satisfy', 'Courgette', 'Indie Flower', 'Permanent Marker', 'Righteous', 'Bangers', 'Black Ops One',
  'Anton', 'Archivo Black', 'Titan One', 'Orbitron', 'Audiowide', 'Russo One', 'Bungee', 'Press Start 2P',
  'Cinzel', 'Cormorant', 'EB Garamond', 'Lora', 'Crimson Text', 'Arvo', 'Josefin Sans', 'Exo 2', 'Kanit', 'Manrope',
  'Outfit', 'Plus Jakarta Sans', 'DM Sans', 'Figtree', 'Space Grotesk', 'Sora', 'Lexend', 'Atkinson Hyperlegible',
  'Fraunces', 'Newsreader', 'Instrument Serif', 'Playfair', 'DM Serif Display', 'Abril Fatface', 'Alfa Slab One',
  'Creepster', 'Fredoka One', 'Lilita One', 'Luckiest Guy', 'Passion One', 'Staatliches', 'Unbounded', 'Yellowtail',
  'Kaushan Script', 'Cookie', 'Alex Brush', 'Allura', 'Comfortaa', 'Zeyada', 'Chalkduster', 'Copperplate', 'Didot',
  'Futura', 'Gill Sans', 'Optima', 'Papyrus', 'American Typewriter', 'Marker Felt', 'Signika', 'Varela Round',
  'Pathway Gothic One', 'Prompt', 'Noto Sans', 'Oxygen', 'Hind', 'Mukta', 'Karla', 'Asap', 'Titillium Web',
  'Questrial', 'Cuprum', 'Barlow', 'Barlow Condensed', 'Libre Franklin', 'Source Code Pro', 'Inconsolata', 'JetBrains Mono',
  'Fira Code', 'Anonymous Pro', 'IBM Plex Mono', 'Red Hat Mono', 'Almendra', 'Amethysta', 'Archivo', 'Arimo', 'Bitter',
  'Cabin', 'Cardo', 'Catamaran', 'Cormorant Garamond', 'Domine', 'El Messiri', 'Encode Sans', 'Epilogue', 'Fahkwang',
  'Fauna One', 'Gothic A1', 'Heebo', 'IBM Plex Sans', 'IBM Plex Serif', 'IM Fell English', 'Inknut Antiqua', 'Jost',
  'Julee', 'Julius Sans One', 'K2D', 'Kadwa', 'Kalam', 'Kameron', 'Kantumruy Pro', 'Karma', 'Katibeh', 'Kavivanar',
  'Kavoon', 'Kelly Slab', 'Kenia', 'Khand', 'Khula', 'Kings', 'Kirang Haerang', 'Kite One', 'Kiwi Maru', 'Klee One',
  'Knewave', 'KoHo', 'Kolker Brush', 'Kosugi', 'Kosugi Maru', 'Kotta One', 'Koulen', 'Kranky', 'Kreon', 'Kristi',
  'Krona One', 'Krub', 'Kufam', 'Kulim Park', 'Kumar One', 'Kumar One Outline', 'Kumbh Sans', 'Kurale', 'La Belle Aurore',
  'Labrada', 'Lacquer', 'Laila', 'Lakki Reddy', 'Landing', 'Langar', 'Lateef', 'League Gothic', 'League Script', 'League Spartan',
  'Leckerli One', 'Ledger', 'Lekton', 'Lexend Deca', 'Lexend Exa', 'Libre Bodoni', 'Libre Caslon Text', 'Licorice',
  'Lily Script One', 'Limelight', 'Literata', 'Livvic', 'Lobster Two', 'Long Cang', 'Love Light', 'Love Ya Like A Sister',
  'Loved by the King', 'Lovers Quarrel', 'Lusitana', 'Luxurious Roman', 'Luxurious Script', 'Macondo', 'Mada', 'Madimi One',
  'Magra', 'Maitree', 'Major Mono Display', 'Mandali', 'Manjari', 'Mansalva', 'Manuale', 'Marcellus', 'Marcellus SC',
  'Marck Script', 'Margarine', 'Marhey', 'Markazi Text', 'Marko One', 'Marmelad', 'Martel', 'Martel Sans', 'Mate', 'Mate SC',
  'Maul', 'McLaren', 'Mea Culpa', 'Meddon', 'MedievalSharp', 'Medula One', 'Megrim', 'Meie Script', 'Merienda',
  'Merriweather Sans', 'Metal Mania', 'Metamorphous', 'Metrophobic', 'Michroma', 'Milonga', 'Miltonian', 'Miltonian Tattoo',
  'Modak', 'Modern Antiqua', 'Mogra', 'Mohave', 'Molengo', 'Molle', 'Monda', 'Monofett', 'Monoton', 'Monsieur La Doulaise',
  'Montaga', 'Montserrat Alternates', 'Moo Lah Lah', 'Moon Dance', 'Moul', 'Moulpali', 'Mountains of Christmas', 'Mouse Memoirs',
  'Mr Bedfort', 'Mr Dafoe', 'Mr De Haviland', 'Mrs Saint Delafield', 'Ms Madi', 'Mukta Mahee', 'Mulish', 'Murecho',
  'MuseoModerno', 'My Soul', 'Mynerve', 'Myriad Pro', 'Mystery Quest', 'NTR', 'Nabla', 'Nanum Brush Script',
  'Nanum Gothic', 'Nanum Gothic Coding', 'Nanum Myeongjo', 'Nanum Pen Script', 'Neonderthaw', 'Neuton', 'New Rocker',
  'New Tegomin', 'News Cycle', 'Niconne', 'Niramit', 'Nixie One', 'Nobile', 'Nokora', 'Norican', 'Nosifer', 'Notable',
  'Nothing You Could Do', 'Noticia Text', 'Noto Color Emoji', 'Noto Kufi Arabic', 'Noto Music', 'Noto Nastaliq Urdu',
  'Noto Rashi Hebrew', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Serif', 'Noto Serif Display', 'Noto Serif JP',
  'Nova Cut', 'Nova Flat', 'Nova Mono', 'Nova Oval', 'Nova Round', 'Nova Script', 'Nova Slim', 'Numans', 'Nunito Sans',
  'Nuosu SIL', 'Odibee Sans', 'Odor Mean Chey', 'Offside', 'Oi', 'Old Standard TT', 'Oldenburg', 'Oleo Script', 'Oleo Script Swash Caps',
  'Onest', 'Oooh Baby', 'Open Sans Condensed', 'Oranienbaum', 'Orbitron', 'Oregano', 'Orelega One', 'Orienta', 'Original Surfer',
  'Oswald', 'Outfit', 'Over the Rainbow', 'Overlock', 'Overlock SC', 'Overpass', 'Overpass Mono', 'Ovo', 'Oxanium',
  'Oxygen Mono', 'PT Mono', 'PT Serif', 'Padyakke Expanded One', 'Padauk', 'Palanquin',
  'Palanquin Dark', 'Palette Mosaic', 'Pangolin', 'Paprika', 'Parisienne', 'Passero One', 'Passion One', 'Passions Conflict',
  'Pathway Extreme', 'Patrick Hand', 'Patrick Hand SC', 'Pattaya', 'Patua One', 'Pavanam', 'Paytone One', 'Peddana',
  'Peralta', 'Permanent Marker', 'Petemoss', 'Petit Formal Script', 'Petrona', 'Philosopher', 'Phudu', 'Piazzolla',
  'Piedra', 'Pinyon Script', 'Pirata One', 'Pixelify Sans', 'Plaster', 'Play', 'Playball', 'Playfair', 'Playfair Display',
  'Plus Jakarta Sans', 'Podkova', 'Poiret One', 'Poller One', 'Poly', 'Pompiere', 'Pontano Sans', 'Poor Story',
  'Poppins', 'Port Lligat Sans', 'Port Lligat Slab', 'Potta One', 'Pragati Narrow', 'Praise', 'Prata', 'Preahvihear',
  'Press Start 2P', 'Pridi', 'Princess Sofia', 'Prociono', 'Prompt', 'Prosto One', 'Protest Guerrilla', 'Protest Revolution',
  'Protest Riot', 'Protest Strike', 'Proxima Nova', 'Puritan', 'Purple Purse', 'Qahiri', 'Quando', 'Quantico',
  'Quattrocento', 'Quattrocento Sans', 'Questrial', 'Quicksand', 'Quintessential', 'Qwigley', 'Qwitcher Grypen',
  'Racing Sans One', 'Radley', 'Rajdhani', 'Rakkas', 'Raleway', 'Raleway Dots', 'Ramabhadra', 'Ramaraja', 'Rambla',
  'Rammetto One', 'Rampart One', 'Ranchers', 'Rancho', 'Ranga', 'Rasa', 'Rationale', 'Ravi Prakash', 'Readex Pro',
  'Recursive', 'Red Hat Display', 'Red Hat Text', 'Redacted', 'Redacted Script', 'Redressed', 'Reem Kufi', 'Reem Kufi Fun',
  'Reem Kufi Ink', 'Reenie Beanie', 'Reggae One', 'Reichenbach', 'REM', 'Remnant', 'Replica', 'Resurrection',
  'Rhodium Libre', 'Ribeye', 'Ribeye Marrow', 'Righteous', 'Risque', 'Road Rage', 'Roboto', 'Roboto Condensed',
  'Roboto Flex', 'Roboto Mono', 'Roboto Serif', 'Roboto Slab', 'Rochester', 'Rock 3D', 'Rock Salt', 'RocknRoll One',
  'Rokkitt', 'Romanesco', 'Ropa Sans', 'Rosario', 'Rosarivo', 'Rouge Script', 'Rowdies', 'Rozha One', 'Rubik',
  'Rubik Beastly', 'Rubik Bubbles', 'Rubik Burned', 'Rubik Dirt', 'Rubik Distressed', 'Rubik Gemstones', 'Rubik Glitch',
  'Rubik Iso', 'Rubik Marker Hatch', 'Rubik Maze', 'Rubik Microbe', 'Rubik Mono One', 'Rubik Moonrocks', 'Rubik Pixels',
  'Rubik Puddles', 'Rubik Scribble', 'Rubik Storm', 'Rubik Vinyl', 'Rubik Wet Paint', 'Ruda', 'Rufina', 'Ruge Boogie',
  'Ruluko', 'Rum Raisin', 'Ruslan Display', 'Russo One', 'Ruthie', 'Ruwudu', 'Rye', 'STIX Two Text', 'Sacramento',
  'Sahitya', 'Sail', 'Saira', 'Saira Condensed', 'Saira Extra Condensed', 'Saira Semi Condensed', 'Saira Stencil One',
  'Salsa', 'Sanchez', 'Sancreek', 'Sansita', 'Sansita Swashed', 'Sarabun', 'Sarala', 'Sarina', 'Sarpanch', 'Sassy Frass',
  'Satisfy', 'Sawarabi Gothic', 'Sawarabi Mincho', 'Scada', 'Scheherazade New', 'Schibsted Grotesk', 'Schoolbell',
  'Scope One', 'Seaweed Script', 'Secular One', 'Sedan', 'Sedan SC', 'Sedgwick Ave', 'Sedgwick Ave Display', 'Sen',
  'Send Flowers', 'Sevillana', 'Seymour One', 'Shadow Into Light', 'Shadows Into Light Two', 'Shalimar',
  'Shanti', 'Share', 'Share Tech', 'Share Tech Mono', 'Shippori Antique', 'Shippori Antique B1', 'Shippori Mincho',
  'Shippori Mincho B1', 'Shizuru', 'Shojumaru', 'Short Stack', 'Shrikhand', 'Siemreap', 'Sigmar', 'Sigmar One',
  'Signika', 'Signika Negative', 'Silkscreen', 'Simonetta', 'Single Day', 'Sintony', 'Sirin Stencil', 'Six Caps',
  'Skranji', 'Slabo 13px', 'Slabo 27px', 'Slackey', 'Slackside One', 'Smooch', 'Smooch Sans', 'Smythe', 'Sniglet',
  'Snippet', 'Snowburst One', 'Sofadi One', 'Sofia', 'Sofia Sans', 'Sofia Sans Condensed', 'Sofia Sans Extra Condensed',
  'Sofia Sans Semi Condensed', 'Solitreo', 'Sometype Mono', 'Song Myung', 'Sono', 'Sonsie One', 'Sora', 'Sorts Mill Goudy',
  'Source Code Pro', 'Source Sans 3', 'Source Serif 4', 'Space Grotesk', 'Space Mono', 'Special Elite', 'Spectral',
  'Spectral SC', 'Spicy Rice', 'Spinnaker', 'Spirax', 'Splash', 'Spline Sans', 'Spline Sans Mono', 'Squada One',
  'Sree Krushnadevaraya', 'Sriracha', 'Srisakdi', 'Staatliches', 'Stalemate', 'Stalinist One', 'Stardos Stencil',
  'Stick', 'Stick No Bills', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke', 'Strait', 'Style Script',
  'Stylish', 'Sue Ellen Francisco', 'Suez One', 'Sulphur Point', 'Sumana', 'Sunflower', 'Sunshiney', 'Supermercado One',
  'Sura', 'Suranna', 'Suravaram', 'Suwannaphum', 'Swanky and Moo Moo', 'Syncopate', 'Syne', 'Syne Mono', 'Syne Tactile',
];
export const FONTS = [...new Set(FONTS_RAW)];

// 4.2 Font Style Presets (50+)
export const FONT_PRESETS = [
  { id: 'default', label: 'Default', font: 'Arial', weight: 'bold' },
  { id: 'classic', label: 'Classic', font: 'Times New Roman', weight: 'normal' },
  { id: 'modern', label: 'Modern', font: 'Roboto', weight: '500' },
  { id: 'elegant', label: 'Elegant', font: 'Playfair Display', weight: 'bold' },
  { id: 'bold', label: 'Bold', font: 'Montserrat', weight: 'bold' },
  { id: 'light', label: 'Light', font: 'Lato', weight: '300' },
  { id: 'handwritten', label: 'Handwritten', font: 'Dancing Script', weight: 'normal' },
  { id: 'tech', label: 'Tech', font: 'Orbitron', weight: 'bold' },
  { id: 'fun', label: 'Fun', font: 'Comic Sans MS', weight: 'normal' },
  { id: 'impact', label: 'Impact', font: 'Impact', weight: 'normal' },
  { id: 'serif', label: 'Serif', font: 'Georgia', weight: 'normal' },
  { id: 'sans', label: 'Sans', font: 'Helvetica', weight: 'normal' },
  { id: 'mono', label: 'Monospace', font: 'Courier New', weight: 'normal' },
  { id: 'changePerWord', label: 'Change per word' },
  { id: 'changeEveryTwo', label: 'Change every 2 words' },
  { id: 'changeEveryThree', label: 'Change every 3 words' },
  { id: 'randomFont', label: 'Random font' },
  { id: 'groupStyle', label: 'Group based' },
  { id: 'headline', label: 'Headline', font: 'Bebas Neue', weight: 'normal' },
  { id: 'quote', label: 'Quote', font: 'Merriweather', weight: 'normal' },
  { id: 'script', label: 'Script', font: 'Great Vibes', weight: 'normal' },
  { id: 'retro', label: 'Retro', font: 'Pacifico', weight: 'normal' },
  { id: 'minimal', label: 'Minimal', font: 'Inter', weight: '300' },
  { id: 'strong', label: 'Strong', font: 'Oswald', weight: 'bold' },
  { id: 'rounded', label: 'Rounded', font: 'Nunito', weight: 'bold' },
  { id: 'condensed', label: 'Condensed', font: 'Bebas Neue', weight: 'normal' },
  { id: 'display', label: 'Display', font: 'Anton', weight: 'normal' },
  { id: 'formal', label: 'Formal', font: 'Cormorant', weight: '600' },
  { id: 'casual', label: 'Casual', font: 'Quicksand', weight: '500' },
  { id: 'syne', label: 'Syne', font: 'Syne', weight: 'bold' },
  { id: 'pixelify', label: 'Pixelify', font: 'Pixelify Sans', weight: 'bold' },
  { id: 'spaceMono', label: 'Space Mono', font: 'Space Mono', weight: 'bold' },
  { id: 'outfit', label: 'Outfit', font: 'Outfit', weight: '500' },
  { id: 'sora', label: 'Sora', font: 'Sora', weight: '500' },
  { id: 'figtree', label: 'Figtree', font: 'Figtree', weight: '600' },
  { id: 'dmSans', label: 'DM Sans', font: 'DM Sans', weight: '500' },
  { id: 'plusJakarta', label: 'Plus Jakarta', font: 'Plus Jakarta Sans', weight: 'bold' },
  { id: 'manrope', label: 'Manrope', font: 'Manrope', weight: '500' },
  { id: 'lexend', label: 'Lexend', font: 'Lexend', weight: '500' },
  { id: 'spaceGrotesk', label: 'Space Grotesk', font: 'Space Grotesk', weight: 'bold' },
  { id: 'libreBaskerville', label: 'Libre Baskerville', font: 'Libre Baskerville', weight: 'normal' },
  { id: 'sourceSerif', label: 'Source Serif', font: 'Source Serif 4', weight: '600' },
  { id: 'crimson', label: 'Crimson', font: 'Crimson Text', weight: '600' },
  { id: 'ebGaramond', label: 'EB Garamond', font: 'EB Garamond', weight: '500' },
  { id: 'spectral', label: 'Spectral', font: 'Spectral', weight: '600' },
  { id: 'newsreader', label: 'Newsreader', font: 'Newsreader', weight: '500' },
  { id: 'instrumentSerif', label: 'Instrument Serif', font: 'Instrument Serif', weight: 'normal' },
  { id: 'fraunces', label: 'Fraunces', font: 'Fraunces', weight: '600' },
  { id: 'alegreya', label: 'Alegreya', font: 'Alegreya', weight: 'bold' },
  { id: 'slabo', label: 'Slabo', font: 'Slabo 27px', weight: 'normal' },
  { id: 'zilla', label: 'Zilla Slab', font: 'Zilla Slab', weight: '600' },
  { id: 'josefin', label: 'Josefin Sans', font: 'Josefin Sans', weight: '600' },
  { id: 'exo', label: 'Exo 2', font: 'Exo 2', weight: 'bold' },
  { id: 'kanit', label: 'Kanit', font: 'Kanit', weight: '600' },
  { id: 'archivo', label: 'Archivo', font: 'Archivo', weight: '600' },
  { id: 'barlow', label: 'Barlow', font: 'Barlow', weight: '600' },
  { id: 'lora', label: 'Lora', font: 'Lora', weight: '600' },
  { id: 'vollkorn', label: 'Vollkorn', font: 'Vollkorn', weight: '600' },
  { id: 'crimsonPro', label: 'Crimson Pro', font: 'Crimson Pro', weight: '600' },
  { id: 'recursive', label: 'Recursive', font: 'Recursive', weight: '600' },
  { id: 'sourceCode', label: 'Source Code Pro', font: 'Source Code Pro', weight: '500' },
  { id: 'jetbrains', label: 'JetBrains Mono', font: 'JetBrains Mono', weight: '500' },
  { id: 'firaCode', label: 'Fira Code', font: 'Fira Code', weight: '500' },
];

// 4.3 Animation Presets (100+)
export const ANIMATION_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'firstWordTop', label: 'First word from top' },
  { id: 'firstTwoTop', label: 'First two from top' },
  { id: 'firstWordBottom', label: 'First word from bottom' },
  { id: 'firstTwoBottom', label: 'First two from bottom' },
  { id: 'sideEntryLeft', label: 'Side entry left' },
  { id: 'sideEntryRight', label: 'Side entry right' },
  { id: 'wordByWord', label: 'Word by word' },
  { id: 'lineByLine', label: 'Line by line' },
  { id: 'charByChar', label: 'Char by char' },
  { id: 'fadeUp', label: 'Fade up' },
  { id: 'fadeDown', label: 'Fade down' },
  { id: 'fadeIn', label: 'Fade in' },
  { id: 'zoomIn', label: 'Zoom in' },
  { id: 'zoomOut', label: 'Zoom out' },
  { id: 'slideUp', label: 'Slide up' },
  { id: 'slideDown', label: 'Slide down' },
  { id: 'slideLeft', label: 'Slide left' },
  { id: 'slideRight', label: 'Slide right' },
  { id: 'bounceIn', label: 'Bounce in' },
  { id: 'bounceUp', label: 'Bounce up' },
  { id: 'elasticIn', label: 'Elastic in' },
  { id: 'rotateIn', label: 'Rotate in' },
  { id: 'flipInX', label: 'Flip in X' },
  { id: 'flipInY', label: 'Flip in Y' },
  { id: 'scaleIn', label: 'Scale in' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'blurIn', label: 'Blur in' },
  { id: 'glowPulse', label: 'Glow pulse' },
  { id: 'shake', label: 'Shake' },
  { id: 'swing', label: 'Swing' },
  { id: 'wobble', label: 'Wobble' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'heartbeat', label: 'Heartbeat' },
  { id: 'float', label: 'Float' },
  { id: 'wave', label: 'Wave' },
  { id: 'staggerUp', label: 'Stagger up' },
  { id: 'staggerDown', label: 'Stagger down' },
  { id: 'cascade', label: 'Cascade' },
  { id: 'ripple', label: 'Ripple' },
  { id: 'domino', label: 'Domino' },
  { id: 'centerPop', label: 'Center pop' },
  { id: 'explode', label: 'Explode' },
  { id: 'assemble', label: 'Assemble' },
  { id: 'curtain', label: 'Curtain' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'split', label: 'Split' },
  { id: 'random', label: 'Random' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'bounceLeft', label: 'Bounce left' },
  { id: 'bounceRight', label: 'Bounce right' },
  { id: 'rotateInLeft', label: 'Rotate in left' },
  { id: 'rotateInRight', label: 'Rotate in right' },
  { id: 'rollIn', label: 'Roll in' },
  { id: 'backInUp', label: 'Back in up' },
  { id: 'backInDown', label: 'Back in down' },
  { id: 'lightSpeedIn', label: 'Light speed in' },
  { id: 'hinge', label: 'Hinge' },
  { id: 'jackInBox', label: 'Jack in box' },
  { id: 'flipIn', label: 'Flip in' },
  { id: 'fadeInUp', label: 'Fade in up' },
  { id: 'fadeInDown', label: 'Fade in down' },
  { id: 'fadeInLeft', label: 'Fade in left' },
  { id: 'fadeInRight', label: 'Fade in right' },
  { id: 'zoomInLeft', label: 'Zoom in left' },
  { id: 'zoomInRight', label: 'Zoom in right' },
  { id: 'slideInUp', label: 'Slide in up' },
  { id: 'slideInDown', label: 'Slide in down' },
  { id: 'slideInLeft', label: 'Slide in left' },
  { id: 'slideInRight', label: 'Slide in right' },
  { id: 'bounceOut', label: 'Bounce out' },
  { id: 'fadeOut', label: 'Fade out' },
  { id: 'grow', label: 'Grow' },
  { id: 'shrink', label: 'Shrink' },
];

// Color Logic (20 options)
export const COLOR_LOGIC_PRESETS = [
  { id: 'none', label: 'None (same color)' },
  { id: 'perWord', label: 'Per word' },
  { id: 'perLine', label: 'Per line' },
  { id: 'everyTwo', label: 'Every 2 words' },
  { id: 'everyThree', label: 'Every 3 words' },
  { id: 'firstWord', label: 'First word different' },
  { id: 'lastWord', label: 'Last word different' },
  { id: 'oddEven', label: 'Odd/Even alternate' },
  { id: 'random', label: 'Random' },
  { id: 'gradientCycle', label: 'Gradient cycle' },
  { id: 'emphasis', label: 'Emphasis word' },
  { id: 'highlight', label: 'Highlight center' },
  { id: 'fadeOut', label: 'Fade end' },
  { id: 'fadeIn', label: 'Fade start' },
  { id: 'rainbow', label: 'Rainbow cycle' },
  { id: 'segment', label: 'Per segment' },
  { id: 'phrase', label: 'Per phrase' },
  { id: 'sentence', label: 'Per sentence' },
  { id: 'charBased', label: 'Char based' },
  { id: 'timeBased', label: 'Time based' },
];

// Animation Logic - controls how animation effect is applied
export const ANIMATION_LOGIC_PRESETS = [
  { id: 'default', label: 'All at once (Default)' },
  { id: 'wordByWord', label: 'Word by Word' },
  { id: 'charByChar', label: 'Character by Character' },
  { id: 'lineByLine', label: 'Line by Line' },
  { id: 'wordByWordReverse', label: 'Word by Word (Reverse)' },
  { id: 'charByCharReverse', label: 'Character by Character (Reverse)' },
  { id: 'lineByLineReverse', label: 'Line by Line (Reverse)' },
  { id: 'wordRandom', label: 'Word Random' },
  { id: 'wordCenterOut', label: 'Word Center Outward' },
  { id: 'wordEdgesIn', label: 'Word Edges Inward' },
];

// Font Logic (50 options)
export const FONT_LOGIC_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'perWord', label: 'Per word' },
  { id: 'everyTwo', label: 'Every 2 words' },
  { id: 'everyThree', label: 'Every 3 words' },
  { id: 'everyFour', label: 'Every 4 words' },
  { id: 'perLine', label: 'Per line' },
  { id: 'perSegment', label: 'Per segment' },
  { id: 'random', label: 'Random' },
  { id: 'firstWord', label: 'First word different' },
  { id: 'lastWord', label: 'Last word different' },
  { id: 'oddEven', label: 'Odd/Even' },
  { id: 'emphasis', label: 'Emphasis word' },
  { id: 'sentenceStart', label: 'Sentence start' },
  { id: 'phrase', label: 'Per phrase' },
  { id: 'charCount', label: 'By char count' },
  { id: 'wordLength', label: 'By word length' },
  { id: 'cycle2', label: 'Cycle 2 fonts' },
  { id: 'cycle3', label: 'Cycle 3 fonts' },
  { id: 'cycle5', label: 'Cycle 5 fonts' },
  { id: 'groupStyle', label: 'Group style' },
  { id: 'alternate', label: 'Alternate' },
  { id: 'reverseSeq', label: 'Reverse sequence' },
  { id: 'centerOut', label: 'Center outward' },
  { id: 'edgesIn', label: 'Edges inward' },
  { id: 'stagger', label: 'Stagger' },
  { id: 'wave', label: 'Wave' },
  { id: 'cascade', label: 'Cascade' },
  { id: 'domino', label: 'Domino' },
  { id: 'ripple', label: 'Ripple' },
  { id: 'burst', label: 'Burst' },
  { id: 'focus', label: 'Focus center' },
  { id: 'highlight', label: 'Highlight word' },
  { id: 'syncVoice', label: 'Sync voice' },
  { id: 'syncBeat', label: 'Sync beat' },
  { id: 'punctuation', label: 'At punctuation' },
  { id: 'comma', label: 'At comma' },
  { id: 'period', label: 'At period' },
  { id: 'question', label: 'At question' },
  { id: 'exclamation', label: 'At exclamation' },
  { id: 'paragraph', label: 'Per paragraph' },
  { id: 'clause', label: 'Per clause' },
  { id: 'timeBased', label: 'Time based' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'randomWords', label: 'Random words' },
  { id: 'custom', label: 'Custom' },
];

// Kinetic extra logic (10 more); merged via KINETIC_LOGIC_ALL (first id wins)
export const KINETIC_EXTRA_LOGIC = [
  { id: 'phrase', label: 'By phrase' },
  { id: 'sentence', label: 'By sentence' },
  { id: 'comma', label: 'At comma' },
  { id: 'period', label: 'At period' },
  { id: 'punctuation', label: 'At punctuation' },
  { id: 'paragraph', label: 'Per paragraph' },
  { id: 'emphasis', label: 'Emphasis' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'syncVoice', label: 'Sync voice' },
  { id: 'syncBeat', label: 'Sync beat' },
];

function uniquePresetsById(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

/** Kinetic logic dropdown options (deduped; use instead of spreading PRESETS + EXTRA). */
export const KINETIC_LOGIC_ALL = uniquePresetsById(KINETIC_LOGIC_PRESETS, KINETIC_EXTRA_LOGIC);

// Word Highlight - Fixed Per Line (20 options)
export const WORD_HIGHLIGHT_LINE_OPTIONS = [
  { id: '1', value: 1, label: '1st word' },
  { id: '2', value: 2, label: '2nd word' },
  { id: '3', value: 3, label: '3rd word' },
  { id: '4', value: 4, label: '4th word' },
  { id: '5', value: 5, label: '5th word' },
  { id: '6', value: 6, label: '6th word' },
  { id: '7', value: 7, label: '7th word' },
  { id: '8', value: 8, label: '8th word' },
  { id: 'last', value: 0, label: 'Last word' },
  { id: 'random', value: 'random', label: 'Random word' },
  { id: 'everyTwo', value: 'everyTwo', label: 'Every 2nd word (2,4,6..)' },
  { id: 'everyThree', value: 'everyThree', label: 'Every 3rd word' },
  { id: 'odd', value: 'odd', label: 'Odd (1st,3rd,5th..)' },
  { id: 'even', value: 'even', label: 'Even (2nd,4th,6th..)' },
  { id: 'firstTwo', value: 'firstTwo', label: 'First 2 words' },
  { id: 'lastTwo', value: 'lastTwo', label: 'Last 2 words' },
  { id: 'center', value: 'center', label: 'Center word' },
  { id: 'firstLast', value: 'firstLast', label: 'First & Last' },
  { id: 'alternate', value: 'alternate', label: 'Alternate (1,3,5..)' },
  { id: 'longest', value: 'longest', label: 'Longest word' },
];

// Icon Logic (20 options)
export const ICON_LOGIC_PRESETS = [
  { id: 'perWord', label: 'Per word' },
  { id: 'perLine', label: 'Per line' },
  { id: 'firstWord', label: 'First word only' },
  { id: 'lastWord', label: 'Last word only' },
  { id: 'everyTwo', label: 'Every 2 words' },
  { id: 'everyThree', label: 'Every 3 words' },
  { id: 'segment', label: 'Per segment' },
  { id: 'random', label: 'Random' },
  { id: 'oddEven', label: 'Odd/Even' },
  { id: 'emphasis', label: 'Emphasis word' },
  { id: 'phrase', label: 'Per phrase' },
  { id: 'sentence', label: 'Per sentence' },
  { id: 'center', label: 'Center word' },
  { id: 'alternate', label: 'Alternate' },
  { id: 'stagger', label: 'Stagger' },
  { id: 'cascade', label: 'Cascade' },
  { id: 'syncVoice', label: 'Sync voice' },
  { id: 'syncBeat', label: 'Sync beat' },
  { id: 'timeBased', label: 'Time based' },
  { id: 'mixed', label: 'Mixed' },
];

// 4.4 Color Presets (30+ solid colors)
export const COLOR_PRESETS = [
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'black', label: 'Black', color: '#000000' },
  { id: 'gold', label: 'Gold', color: '#FFD700' },
  { id: 'silver', label: 'Silver', color: '#C0C0C0' },
  { id: 'red', label: 'Red', color: '#FF0000' },
  { id: 'blue', label: 'Blue', color: '#0066FF' },
  { id: 'green', label: 'Green', color: '#00CC00' },
  { id: 'yellow', label: 'Yellow', color: '#FFFF00' },
  { id: 'orange', label: 'Orange', color: '#FF9900' },
  { id: 'purple', label: 'Purple', color: '#9933FF' },
  { id: 'pink', label: 'Pink', color: '#FF69B4' },
  { id: 'cyan', label: 'Cyan', color: '#00FFFF' },
  { id: 'neon', label: 'Neon', color: '#39FF14' },
  { id: 'coral', label: 'Coral', color: '#FF7F50' },
  { id: 'teal', label: 'Teal', color: '#008080' },
  { id: 'lime', label: 'Lime', color: '#32CD32' },
  { id: 'magenta', label: 'Magenta', color: '#FF00FF' },
  { id: 'navy', label: 'Navy', color: '#000080' },
  { id: 'maroon', label: 'Maroon', color: '#800000' },
  { id: 'olive', label: 'Olive', color: '#808000' },
  { id: 'indigo', label: 'Indigo', color: '#4B0082' },
  { id: 'crimson', label: 'Crimson', color: '#DC143C' },
  { id: 'turquoise', label: 'Turquoise', color: '#40E0D0' },
  { id: 'salmon', label: 'Salmon', color: '#FA8072' },
  { id: 'lavender', label: 'Lavender', color: '#E6E6FA' },
  { id: 'mint', label: 'Mint', color: '#98FF98' },
  { id: 'peach', label: 'Peach', color: '#FFCBA4' },
  { id: 'rose', label: 'Rose', color: '#FF007F' },
  { id: 'sky', label: 'Sky Blue', color: '#87CEEB' },
  { id: 'ivory', label: 'Ivory', color: '#FFFFF0' },
  { id: 'cream', label: 'Cream', color: '#FFFDD0' },
  { id: 'amber', label: 'Amber', color: '#FFBF00' },
  { id: 'coralPink', label: 'Coral Pink', color: '#F88379' },
  { id: 'electricBlue', label: 'Electric Blue', color: '#7DF9FF' },
  { id: 'chartreuse', label: 'Chartreuse', color: '#7FFF00' },
  { id: 'custom', label: 'Custom' },
];

// 4.4b Gradient Presets (30+)
export const GRADIENT_PRESETS = [
  { id: 'sunset', label: 'Sunset', colors: ['#FF6B6B', '#FFE66D'] },
  { id: 'ocean', label: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { id: 'forest', label: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { id: 'fire', label: 'Fire', colors: ['#f12711', '#f5af19'] },
  { id: 'aurora', label: 'Aurora', colors: ['#00c6ff', '#0072ff'] },
  { id: 'sunrise', label: 'Sunrise', colors: ['#FF512F', '#F09819'] },
  { id: 'midnight', label: 'Midnight', colors: ['#232526', '#414345'] },
  { id: 'peach', label: 'Peach Dream', colors: ['#FFECD2', '#FCB69F'] },
  { id: 'purpleHaze', label: 'Purple Haze', colors: ['#a18cd1', '#fbc2eb'] },
  { id: 'tropical', label: 'Tropical', colors: ['#11998e', '#38ef7d'] },
  { id: 'berry', label: 'Berry', colors: ['#8e2de2', '#4a00e0'] },
  { id: 'candy', label: 'Candy', colors: ['#FF9A9E', '#FECFEF'] },
  { id: 'arctic', label: 'Arctic', colors: ['#89f7fe', '#66a6ff'] },
  { id: 'ember', label: 'Ember', colors: ['#f093fb', '#f5576c'] },
  { id: 'golden', label: 'Golden', colors: ['#FFD700', '#FFA500'] },
  { id: 'mint', label: 'Mint Fresh', colors: ['#a8edea', '#fed6e3'] },
  { id: 'neon', label: 'Neon', colors: ['#00FF87', '#60EFFF'] },
  { id: 'royal', label: 'Royal', colors: ['#667eea', '#764ba2'] },
  { id: 'lavender', label: 'Lavender', colors: ['#e0c3fc', '#8ec5fc'] },
  { id: 'rainbow', label: 'Rainbow', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'] },
  { id: 'chrome', label: 'Chrome', colors: ['#FFFFFF', '#E0E0E0', '#333333'] },
  { id: 'sakura', label: 'Sakura', colors: ['#ffecd2', '#fcb69f'] },
  { id: 'aurora2', label: 'Aurora 2', colors: ['#00c6fb', '#005bea'] },
  { id: 'sunset2', label: 'Sunset 2', colors: ['#fa709a', '#fee140'] },
  { id: 'ocean2', label: 'Ocean 2', colors: ['#2E3192', '#1BFFFF'] },
  { id: 'emerald', label: 'Emerald', colors: ['#134e5e', '#71b280'] },
  { id: 'rose', label: 'Rose Gold', colors: ['#f6d365', '#fda085'] },
  { id: 'plum', label: 'Plum', colors: ['#667eea', '#f093fb'] },
  { id: 'cyber', label: 'Cyber', colors: ['#00d2ff', '#3a7bd5'] },
  { id: 'retro', label: 'Retro', colors: ['#ffecd2', '#fcb69f'] },
  { id: 'ice', label: 'Ice', colors: ['#89CFF0', '#FFFFFF'] },
  { id: 'volcano', label: 'Volcano', colors: ['#f12711', '#f5af19', '#FF0000'] },
  { id: 'custom', label: 'Custom' },
];

// 4.5 Meaning-based icon mapping (keyword -> emoji) - 200+ icons
export const MEANING_ICONS = {
  love: '❤️', heart: '❤️', happy: '😊', smile: '😊', sad: '😢', angry: '😠', fire: '🔥', star: '⭐',
  sun: '☀️', moon: '🌙', music: '🎵', food: '🍕', water: '💧', money: '💰', time: '⏰', book: '📚',
  home: '🏠', car: '🚗', plane: '✈️', phone: '📱', key: '🔑', lock: '🔒', light: '💡', idea: '💡',
  success: '✅', check: '✅', ok: '👍', no: '❌', warning: '⚠️', question: '❓', play: '▶️',
  stop: '⏹️', pause: '⏸️', fast: '⚡', slow: '🐢', big: '🐘', small: '🐜', up: '⬆️', down: '⬇️',
  left: '⬅️', right: '➡️', thanks: '🙏', yes: '👍', cool: '😎', bye: '👋', morning: '🌅', night: '🌙',
  day: '☀️', rain: '🌧️', snow: '❄️', cloud: '☁️', wind: '💨', thunder: '⚡', hot: '🌡️', cold: '🥶',
  work: '💼', job: '👔', business: '📊', team: '👥', people: '👨‍👩‍👧‍👦', family: '👨‍👩‍👧', friend: '🤝', hello: '👋',
  welcome: '🎉', celebrate: '🎊', party: '🥳', gift: '🎁', cake: '🎂', birthday: '🎈', new: '✨', old: '📜',
  start: '🚀', end: '🏁', begin: '▶️', finish: '✅', complete: '✔️', done: '✓', win: '🏆', lose: '😔',
  power: '⚡', energy: '🔋', strong: '💪', weak: '🫠', health: '❤️‍🩹', doctor: '👨‍⚕️', hospital: '🏥', medicine: '💊',
  school: '🏫', student: '📚', teacher: '👩‍🏫', learn: '📖', study: '✏️', exam: '📝', pass: '✅', fail: '❌',
  travel: '✈️', journey: '🛤️', road: '🛣️', map: '🗺️', world: '🌍', india: '🇮🇳', flag: '🚩',
  nature: '🌿', tree: '🌳', flower: '🌸', plant: '🌱', garden: '🏡', mountain: '⛰️', ocean: '🌊', beach: '🏖️',
  animal: '🐾', dog: '🐕', cat: '🐱', bird: '🐦', fish: '🐟', lion: '🦁', tiger: '🐯', elephant: '🐘',
  sport: '⚽', game: '🎮', ball: '⚾', run: '🏃', swim: '🏊', bike: '🚴', gym: '💪', medal: '🥇',
  art: '🎨', paint: '🖌️', draw: '✏️', photo: '📷', camera: '📸', movie: '🎬', video: '📹', tv: '📺',
  tech: '💻', computer: '🖥️', laptop: '💻', mobile: '📱', internet: '🌐', email: '📧', code: '💻', app: '📲',
  shop: '🛒', buy: '🛍️', sell: '💰', price: '🏷️', discount: '🏷️', cart: '🛒', delivery: '📦',
  eat: '🍽️', drink: '🥤', coffee: '☕', tea: '🍵', breakfast: '🍳', lunch: '🥗', dinner: '🍖',
  sleep: '😴', wake: '⏰', rest: '🛏️', relax: '😌', vacation: '🏖️', holiday: '🎄',
  dance: '💃', sing: '🎤', guitar: '🎸', piano: '🎹', drum: '🥁', mic: '🎙️',
  read: '📖', write: '✍️', news: '📰', paper: '📄', document: '📋', file: '📁',
  number: '🔢', one: '1️⃣', two: '2️⃣', three: '3️⃣', count: '🔢', plus: '➕', minus: '➖',
  share: '🔗', link: '🔗', connect: '🔌', network: '🕸️', cloud: '☁️', data: '📊',
  protect: '🛡️', safe: '🔒', secure: '🔐', privacy: '🙈', secret: '🤫',
  grow: '📈', increase: '📊', decrease: '📉', change: '🔄', update: '🆕', progress: '📶',
  support: '🤝', help: '🆘', service: '🔧', quality: '⭐', best: '🥇', top: '🏆',
  dream: '💭', hope: '🌟', wish: '🍀', luck: '🍀', future: '🔮', past: '📜',
  peace: '☮️', war: '⚔️', fight: '👊', win: '🏆', champion: '🥇', hero: '🦸',
  magic: '✨', wonder: '😮', amazing: '😍', awesome: '🤩', great: '👍', good: '👍', bad: '👎',
  true: '✅', false: '❌', maybe: '🤔', think: '🤔', know: '💡', understand: '📖',
  open: '🔓', close: '🔒', enter: '🚪', exit: '🚪', in: '➡️', out: '⬅️',
  first: '1️⃣', last: '🔚', next: '➡️', previous: '⬅️', back: '⬅️', forward: '➡️',
  break: '⏸️', continue: '▶️', repeat: '🔁', loop: '🔄', once: '1️⃣', always: '♾️',
  today: '📅', tomorrow: '📆', yesterday: '📅', week: '📆', month: '🗓️', year: '📅',
  hot: '🔥', warm: '🌡️', cool: '❄️', cold: '🥶', perfect: '💯', excellent: '🌟',
};

// Auto Preset Categories
export const AUTO_PRESET_CATEGORIES = [
  { id: 'video', label: '🎬 Video Mode' },
  { id: 'bold', label: '💪 Bold / Impact' },
  { id: 'elegant', label: '✨ Elegant / Serif' },
  { id: 'modern', label: '🔷 Modern / Sans' },
  { id: 'script', label: '✍️ Script / Handwritten' },
  { id: 'tech', label: '⚡ Tech / Display' },
  { id: 'fun', label: '🎉 Fun / Casual' },
  { id: 'perWord', label: '📝 Per Word / Line Effects' },
  { id: 'minimal', label: '◻️ Minimal / Clean' },
  { id: 'premium', label: '💎 Premium / Creative' },
  { id: 'newFonts', label: '🆕 New Fonts Collection' },
  { id: 'other', label: '📋 Other' },
];

// Auto Presets - categorized: select karte hi kinetic, animation, font, color sab auto-apply
export const AUTO_PRESETS = [
  { id: '1', label: 'Clean White', category: 'minimal', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Arial', fontPreset: 'default', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '2', label: 'Bold Gold', category: 'bold', kinetic: 'scalePop', animation: 'zoomIn', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '3', label: 'Per Word Rainbow', category: 'perWord', kinetic: 'fadeIn', animation: 'wordByWord', font: 'Roboto', fontPreset: 'modern', fontLogic: 'perWord', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'perWord' },
  { id: '4', label: 'Classic Serif', category: 'elegant', kinetic: 'none', animation: 'fadeIn', font: 'Times New Roman', fontPreset: 'classic', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '5', label: 'Tech Neon', category: 'tech', kinetic: 'glow', animation: 'glowPulse', font: 'Orbitron', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: '6', label: 'Elegant Per Line', category: 'perWord', kinetic: 'fadeSlide', animation: 'lineByLine', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'perLine', color: '#FFD700', colorPreset: 'gold', colorLogic: 'perLine' },
  { id: '7', label: 'Handwritten Soft', category: 'script', kinetic: 'float', animation: 'fadeUp', font: 'Dancing Script', fontPreset: 'handwritten', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: '8', label: 'Impact Red', category: 'bold', kinetic: 'scaleBounce', animation: 'bounceIn', font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FF0000', colorPreset: 'red', colorLogic: 'none' },
  { id: '9', label: 'Every Two Words', category: 'perWord', kinetic: 'slideFromBottom', animation: 'staggerUp', font: 'Lato', fontPreset: 'light', fontLogic: 'everyTwo', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'everyTwo' },
  { id: '10', label: 'Quote Style', category: 'elegant', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Merriweather', fontPreset: 'quote', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: '11', label: 'Odd Even Mix', category: 'perWord', kinetic: 'pulse', animation: 'pulse', font: 'Poppins', fontPreset: 'rounded', fontLogic: 'oddEven', color: '#9933FF', colorPreset: 'purple', colorLogic: 'oddEven' },
  { id: '12', label: 'Script Elegance', category: 'script', kinetic: 'fadeSlide', animation: 'fadeUp', font: 'Great Vibes', fontPreset: 'script', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '13', label: 'Headline Bold', category: 'bold', kinetic: 'zoomIn', animation: 'scaleIn', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '14', label: 'Ocean Gradient', category: 'fun', kinetic: 'gradientShift', animation: 'fadeIn', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'none', color: '#667eea', colorPreset: 'ocean', colorLogic: 'none' },
  { id: '15', label: 'First Word Pop', category: 'perWord', kinetic: 'scalePop', animation: 'firstWordTop', font: 'Oswald', fontPreset: 'strong', fontLogic: 'firstWord', color: '#FF9900', colorPreset: 'orange', colorLogic: 'firstWord' },
  { id: '16', label: 'Minimal Light', category: 'minimal', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '17', label: 'Cycle 2 Fonts', category: 'perWord', kinetic: 'elastic', animation: 'elasticIn', font: 'Roboto', fontPreset: 'modern', fontLogic: 'cycle2', color: '#00CC00', colorPreset: 'green', colorLogic: 'everyTwo' },
  { id: '18', label: 'Retro Vibes', category: 'fun', kinetic: 'wave', animation: 'wave', font: 'Pacifico', fontPreset: 'retro', fontLogic: 'none', color: '#FF6B6B', colorPreset: 'sunset', colorLogic: 'none' },
  { id: '19', label: 'Last Word Highlight', category: 'perWord', kinetic: 'slideFromBottom', animation: 'firstWordBottom', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'lastWord', color: '#54A0FF', colorPreset: 'blue', colorLogic: 'lastWord' },
  { id: '20', label: 'Display Strong', category: 'bold', kinetic: 'scalePop', animation: 'zoomIn', font: 'Anton', fontPreset: 'display', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: '21', label: 'Random Colors', category: 'perWord', kinetic: 'colorPop', animation: 'random', font: 'Rubik', fontPreset: 'rounded', fontLogic: 'random', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'random' },
  { id: '22', label: 'Stagger Cascade', category: 'perWord', kinetic: 'cascade', animation: 'cascade', font: 'Source Sans Pro', fontPreset: 'sans', fontLogic: 'stagger', color: '#00FFFF', colorPreset: 'cyan', colorLogic: 'perWord' },
  { id: '23', label: 'Typewriter Effect', category: 'tech', kinetic: 'typewriter', animation: 'typewriter', font: 'Courier New', fontPreset: 'mono', fontLogic: 'none', color: '#00FF00', colorPreset: 'green', colorLogic: 'none' },
  { id: '24', label: 'Slide From Left', category: 'modern', kinetic: 'slideFromLeft', animation: 'sideEntryLeft', font: 'Raleway', fontPreset: 'sans', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: '25', label: 'Slide From Right', category: 'modern', kinetic: 'slideFromRight', animation: 'sideEntryRight', font: 'PT Sans', fontPreset: 'sans', fontLogic: 'none', color: '#0066FF', colorPreset: 'blue', colorLogic: 'none' },
  { id: '26', label: 'Formal Style', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Cormorant', fontPreset: 'formal', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: '27', label: 'Heartbeat Pulse', kinetic: 'heartbeat', animation: 'heartbeat', font: 'Nunito', fontPreset: 'rounded', fontLogic: 'none', color: '#FF6B6B', colorPreset: 'red', colorLogic: 'none' },
  { id: '28', label: 'Cycle 3 Fonts', kinetic: 'bounceIn', animation: 'bounceIn', font: 'Lato', fontPreset: 'light', fontLogic: 'cycle3', color: '#FFE66D', colorPreset: 'yellow', colorLogic: 'everyTwo' },
  { id: '29', label: 'Wobble Fun', kinetic: 'wobble', animation: 'wobble', font: 'Comic Sans MS', fontPreset: 'fun', fontLogic: 'none', color: '#FF9900', colorPreset: 'orange', colorLogic: 'none' },
  { id: '30', label: 'Flip X Entry', kinetic: 'flipX', animation: 'flipInX', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#9933FF', colorPreset: 'purple', colorLogic: 'none' },
  { id: '31', label: 'Flip Y Entry', kinetic: 'flipY', animation: 'flipInY', font: 'Oswald', fontPreset: 'strong', fontLogic: 'none', color: '#00D2D3', colorPreset: 'cyan', colorLogic: 'none' },
  { id: '32', label: 'Blur In', kinetic: 'blurIn', animation: 'blurIn', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '33', label: 'Shake Alert', kinetic: 'shake', animation: 'shake', font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FF0000', colorPreset: 'red', colorLogic: 'none' },
  { id: '34', label: 'Drop In', kinetic: 'drop', animation: 'slideDown', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '35', label: 'Swing Rhythm', kinetic: 'swing', animation: 'swing', font: 'Dancing Script', fontPreset: 'handwritten', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: '36', label: 'Rubber Band', kinetic: 'rubberBand', animation: 'elasticIn', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'none', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'none' },
  { id: '37', label: 'Per Line Color', kinetic: 'fadeSlide', animation: 'lineByLine', font: 'Georgia', fontPreset: 'serif', fontLogic: 'perLine', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'perLine' },
  { id: '38', label: 'Alternate Style', kinetic: 'pulse', animation: 'pulse', font: 'Roboto', fontPreset: 'modern', fontLogic: 'alternate', color: '#667eea', colorPreset: 'ocean', colorLogic: 'oddEven' },
  { id: '39', label: 'Center Out', kinetic: 'centerOut', animation: 'centerPop', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'centerOut', color: '#FFD700', colorPreset: 'gold', colorLogic: 'perWord' },
  { id: '40', label: 'Domino Fall', kinetic: 'domino', animation: 'domino', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'domino', color: '#00CC00', colorPreset: 'green', colorLogic: 'perWord' },
  { id: '41', label: 'Ripple Spread', kinetic: 'ripple', animation: 'ripple', font: 'Lato', fontPreset: 'light', fontLogic: 'ripple', color: '#0066FF', colorPreset: 'blue', colorLogic: 'perWord' },
  { id: '42', label: 'Fire Gradient', kinetic: 'gradientShift', animation: 'fadeIn', font: 'Anton', fontPreset: 'display', fontLogic: 'none', color: '#f12711', colorPreset: 'fire', colorLogic: 'none' },
  { id: '43', label: 'Forest Green', kinetic: 'fadeIn', animation: 'fadeUp', font: 'Merriweather', fontPreset: 'quote', fontLogic: 'none', color: '#11998e', colorPreset: 'forest', colorLogic: 'none' },
  { id: '44', label: 'Aurora Blue', kinetic: 'glow', animation: 'glowPulse', font: 'Space Grotesk', fontPreset: 'tech', fontLogic: 'none', color: '#00c6ff', colorPreset: 'aurora', colorLogic: 'none' },
  { id: '45', label: 'Every Three Words', kinetic: 'stagger', animation: 'staggerUp', font: 'Poppins', fontPreset: 'rounded', fontLogic: 'everyThree', color: '#FF6B6B', colorPreset: 'red', colorLogic: 'everyTwo' },
  { id: '46', label: 'Curtain Reveal', kinetic: 'curtain', animation: 'curtain', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '47', label: 'Explode In', kinetic: 'explode', animation: 'explode', font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FF9900', colorPreset: 'orange', colorLogic: 'none' },
  { id: '48', label: 'Assemble', kinetic: 'assemble', animation: 'assemble', font: 'Orbitron', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: '49', label: 'Jello Wiggle', kinetic: 'jello', animation: 'wobble', font: 'Comic Sans MS', fontPreset: 'fun', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: '50', label: 'Tada Celebrate', kinetic: 'tada', animation: 'bounceIn', font: 'Luckiest Guy', fontPreset: 'display', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '51', label: 'Flash Attention', kinetic: 'flash', animation: 'fadeIn', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FFFF00', colorPreset: 'yellow', colorLogic: 'none' },
  { id: '52', label: 'Spring Bounce', kinetic: 'spring', animation: 'elasticIn', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'none', color: '#00CC00', colorPreset: 'green', colorLogic: 'none' },
  { id: '53', label: 'Line Reveal', kinetic: 'lineReveal', animation: 'wipe', font: 'Roboto', fontPreset: 'modern', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '54', label: 'Split Reveal', kinetic: 'splitReveal', animation: 'split', font: 'Oswald', fontPreset: 'strong', fontLogic: 'none', color: '#9933FF', colorPreset: 'purple', colorLogic: 'none' },
  { id: '55', label: 'Every Four Words', kinetic: 'cascade', animation: 'cascade', font: 'Lato', fontPreset: 'light', fontLogic: 'everyFour', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'everyTwo' },
  { id: '56', label: 'Zoom Out', kinetic: 'zoomOut', animation: 'zoomOut', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: '57', label: 'Rotate In', kinetic: 'rotateIn', animation: 'rotateIn', font: 'Pacifico', fontPreset: 'retro', fontLogic: 'none', color: '#FF6B6B', colorPreset: 'sunset', colorLogic: 'none' },
  { id: '58', label: 'Edges In', kinetic: 'edgesIn', animation: 'assemble', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'edgesIn', color: '#FFD700', colorPreset: 'gold', colorLogic: 'perWord' },
  { id: '59', label: 'Wave Order', kinetic: 'wave', animation: 'wave', font: 'Dancing Script', fontPreset: 'handwritten', fontLogic: 'wave', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'perWord' },
  { id: '60', label: 'Stagger Up', kinetic: 'stagger', animation: 'staggerUp', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'stagger', color: '#0066FF', colorPreset: 'blue', colorLogic: 'perWord' },
  { id: '61', label: 'Cycle 5 Fonts', kinetic: 'fadeIn', animation: 'wordByWord', font: 'Arial', fontPreset: 'default', fontLogic: 'cycle5', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'perWord' },
  { id: '62', label: 'Slide Up', kinetic: 'slideFromBottom', animation: 'slideUp', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: '63', label: 'Slide Down', kinetic: 'slideFromTop', animation: 'slideDown', font: 'Anton', fontPreset: 'display', fontLogic: 'none', color: '#FF0000', colorPreset: 'red', colorLogic: 'none' },
  { id: '64', label: 'Burst Center', kinetic: 'burst', animation: 'centerPop', font: 'Impact', fontPreset: 'impact', fontLogic: 'burst', color: '#FF9900', colorPreset: 'orange', colorLogic: 'perWord' },
  { id: '65', label: 'Focus Center', kinetic: 'focus', animation: 'centerPop', font: 'Georgia', fontPreset: 'serif', fontLogic: 'focus', color: '#FFD700', colorPreset: 'gold', colorLogic: 'emphasis' },
  { id: '66', label: 'Highlight Word', kinetic: 'highlight', animation: 'wordByWord', font: 'Roboto', fontPreset: 'modern', fontLogic: 'highlight', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'emphasis' },
  { id: '67', label: 'Implode', kinetic: 'implode', animation: 'assemble', font: 'Orbitron', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: '68', label: 'Scatter', kinetic: 'scatter', animation: 'explode', font: 'Poppins', fontPreset: 'rounded', fontLogic: 'none', color: '#9933FF', colorPreset: 'purple', colorLogic: 'none' },
  { id: '69', label: 'Condensed Style', kinetic: 'zoomIn', animation: 'scaleIn', font: 'Bebas Neue', fontPreset: 'condensed', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '70', label: 'Mask Reveal', kinetic: 'maskReveal', animation: 'wipe', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#00FFFF', colorPreset: 'cyan', colorLogic: 'none' },
  { id: '71', label: 'Underline Accent', kinetic: 'underline', animation: 'fadeIn', font: 'Cormorant', fontPreset: 'formal', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: '72', label: 'Sparkle Glow', kinetic: 'sparkle', animation: 'glowPulse', font: 'Great Vibes', fontPreset: 'script', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '73', label: 'Glitch Effect', kinetic: 'glitch', animation: 'random', font: 'Orbitron', fontPreset: 'tech', fontLogic: 'random', color: '#00FF00', colorPreset: 'green', colorLogic: 'random' },
  { id: '74', label: 'Neon Glow', kinetic: 'neon', animation: 'glowPulse', font: 'Audiowide', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: '75', label: 'Outline Bold', kinetic: 'outline', animation: 'fadeIn', font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '76', label: 'Shadow Depth', kinetic: 'shadow', animation: 'fadeIn', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '77', label: 'Letter Spacing', kinetic: 'letterSpacing', animation: 'charByChar', font: 'Lato', fontPreset: 'light', fontLogic: 'none', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'none' },
  { id: '78', label: 'Group Style', kinetic: 'fadeSlide', animation: 'lineByLine', font: 'Roboto', fontPreset: 'modern', fontLogic: 'groupStyle', color: '#667eea', colorPreset: 'ocean', colorLogic: 'perLine' },
  { id: '79', label: 'Reverse Sequence', kinetic: 'domino', animation: 'domino', font: 'Oswald', fontPreset: 'strong', fontLogic: 'reverseSeq', color: '#FF6B6B', colorPreset: 'red', colorLogic: 'perWord' },
  { id: '80', label: 'Mixed Random', kinetic: 'mixed', animation: 'mixed', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'mixed', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'random' },
  { id: '81', label: 'Emphasis Word', kinetic: 'scalePop', animation: 'wordByWord', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'emphasis', color: '#FFD700', colorPreset: 'gold', colorLogic: 'emphasis' },
  { id: '82', label: 'Sentence Start', kinetic: 'fadeIn', animation: 'lineByLine', font: 'Merriweather', fontPreset: 'quote', fontLogic: 'sentenceStart', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'perLine' },
  { id: '83', label: 'Phrase Style', kinetic: 'cascade', animation: 'cascade', font: 'Georgia', fontPreset: 'serif', fontLogic: 'phrase', color: '#0066FF', colorPreset: 'blue', colorLogic: 'phrase' },
  { id: '84', label: 'Per Segment', kinetic: 'ripple', animation: 'ripple', font: 'Poppins', fontPreset: 'rounded', fontLogic: 'perSegment', color: '#9933FF', colorPreset: 'purple', colorLogic: 'perSegment' },
  { id: '85', label: 'Black & Gold', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: '86', label: 'White on Dark', kinetic: 'zoomIn', animation: 'zoomIn', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '87', label: 'Silver Elegance', kinetic: 'fadeSlide', animation: 'fadeUp', font: 'Cormorant', fontPreset: 'formal', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: '88', label: 'Yellow Energy', kinetic: 'pulse', animation: 'pulse', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#FFFF00', colorPreset: 'yellow', colorLogic: 'none' },
  { id: '89', label: 'Green Fresh', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Nunito', fontPreset: 'rounded', fontLogic: 'none', color: '#00CC00', colorPreset: 'green', colorLogic: 'none' },
  { id: '90', label: 'Blue Trust', kinetic: 'slideFromLeft', animation: 'sideEntryLeft', font: 'Source Sans Pro', fontPreset: 'sans', fontLogic: 'none', color: '#0066FF', colorPreset: 'blue', colorLogic: 'none' },
  { id: '91', label: 'Pink Romance', kinetic: 'float', animation: 'float', font: 'Dancing Script', fontPreset: 'handwritten', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: '92', label: 'Purple Royal', kinetic: 'scalePop', animation: 'bounceIn', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#9933FF', colorPreset: 'purple', colorLogic: 'none' },
  { id: '93', label: 'Cyan Modern', kinetic: 'blurIn', animation: 'blurIn', font: 'Roboto', fontPreset: 'modern', fontLogic: 'none', color: '#00FFFF', colorPreset: 'cyan', colorLogic: 'none' },
  { id: '94', label: 'Orange Warm', kinetic: 'elastic', animation: 'elasticIn', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FF9900', colorPreset: 'orange', colorLogic: 'none' },
  { id: '95', label: 'Monospace Code', kinetic: 'typewriter', animation: 'typewriter', font: 'Courier New', fontPreset: 'mono', fontLogic: 'none', color: '#00FF00', colorPreset: 'green', colorLogic: 'none' },
  { id: '96', label: 'Sans Clean', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Helvetica', fontPreset: 'sans', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: '97', label: 'Rounded Friendly', kinetic: 'bounceIn', animation: 'bounceIn', font: 'Nunito', fontPreset: 'rounded', fontLogic: 'perWord', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'perWord' },
  { id: '98', label: 'Strong Condensed', kinetic: 'zoomIn', animation: 'scaleIn', font: 'Oswald', fontPreset: 'strong', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: '99', label: 'Casual Relaxed', kinetic: 'wave', animation: 'wave', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'none', color: '#11998e', colorPreset: 'forest', colorLogic: 'none' },
  { id: '100', label: 'Full Premium', kinetic: 'gradientShift', animation: 'cascade', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'perLine', color: '#FFD700', colorPreset: 'gold', colorLogic: 'perLine' },
  // Video-optimized
  { id: 'video1', label: 'White Bold', category: 'video', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'video2', label: 'Black Clean', category: 'video', kinetic: 'fadeIn', animation: 'zoomIn', font: 'Arial', fontPreset: 'default', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none', styleType: 'stroke', strokeColor: '#FFFFFF' },
  { id: 'video3', label: 'Neon Pop', category: 'video', kinetic: 'glow', animation: 'fadeIn', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'video4', label: 'Gold Elegant', category: 'video', kinetic: 'fadeSlide', animation: 'fadeUp', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'video5', label: 'Per Word Flow', category: 'video', kinetic: 'scalePop', animation: 'wordByWord', font: 'Roboto', fontPreset: 'modern', fontLogic: 'perWord', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'perWord', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'video6', label: 'Cyan Modern', category: 'video', kinetic: 'slideFromBottom', animation: 'slideUp', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#00FFFF', colorPreset: 'cyan', colorLogic: 'none', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'video7', label: 'Subtle White Box', category: 'video', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Lato', fontPreset: 'light', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none', styleType: 'box', bgColor: 'rgba(0,0,0,0.5)' },
  // New Fonts Collection (from 200+ fonts)
  { id: 'nf1', label: 'Syne Bold', category: 'newFonts', kinetic: 'fadeIn', animation: 'zoomIn', font: 'Syne', fontPreset: 'bold', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: 'nf2', label: 'Pixelify Sans', category: 'newFonts', kinetic: 'scalePop', animation: 'bounceIn', font: 'Pixelify Sans', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: 'nf3', label: 'Rubik Glitch', category: 'newFonts', kinetic: 'glitch', animation: 'random', font: 'Rubik Glitch', fontPreset: 'tech', fontLogic: 'none', color: '#00FF00', colorPreset: 'green', colorLogic: 'none' },
  { id: 'nf4', label: 'Space Mono', category: 'newFonts', kinetic: 'typewriter', animation: 'typewriter', font: 'Space Mono', fontPreset: 'mono', fontLogic: 'none', color: '#00FFFF', colorPreset: 'cyan', colorLogic: 'none' },
  { id: 'nf5', label: 'Playfair Display', category: 'newFonts', kinetic: 'fadeSlide', animation: 'fadeUp', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: 'nf6', label: 'Outfit Modern', category: 'newFonts', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Outfit', fontPreset: 'modern', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: 'nf7', label: 'Lobster Fun', category: 'newFonts', kinetic: 'wave', animation: 'wave', font: 'Lobster', fontPreset: 'fun', fontLogic: 'none', color: '#FF6B6B', colorPreset: 'sunset', colorLogic: 'none' },
  { id: 'nf8', label: 'Sora Minimal', category: 'newFonts', kinetic: 'blurIn', animation: 'blurIn', font: 'Sora', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: 'nf9', label: 'Bebas Neue Headline', category: 'newFonts', kinetic: 'zoomIn', animation: 'scaleIn', font: 'Bebas Neue', fontPreset: 'headline', fontLogic: 'none', color: '#000000', colorPreset: 'black', colorLogic: 'none' },
  { id: 'nf10', label: 'Figtree Rounded', category: 'newFonts', kinetic: 'bounceIn', animation: 'bounceIn', font: 'Figtree', fontPreset: 'rounded', fontLogic: 'none', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'none' },
  { id: 'nf11', label: 'Libre Baskerville Serif', category: 'newFonts', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Libre Baskerville', fontPreset: 'serif', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: 'nf12', label: 'DM Sans Clean', category: 'newFonts', kinetic: 'slideFromBottom', animation: 'slideUp', font: 'DM Sans', fontPreset: 'modern', fontLogic: 'none', color: '#9933FF', colorPreset: 'purple', colorLogic: 'none' },
  { id: 'nf13', label: 'Plus Jakarta Bold', category: 'newFonts', kinetic: 'scalePop', animation: 'zoomIn', font: 'Plus Jakarta Sans', fontPreset: 'bold', fontLogic: 'none', color: '#FF9900', colorPreset: 'orange', colorLogic: 'none' },
  { id: 'nf14', label: 'Manrope Soft', category: 'newFonts', kinetic: 'float', animation: 'float', font: 'Manrope', fontPreset: 'light', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: 'nf15', label: 'Lexend Readable', category: 'newFonts', kinetic: 'fadeIn', animation: 'fadeIn', font: 'Lexend', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  // Premium / Creative Collection
  { id: 'p1', label: 'Glow Wave', category: 'premium', kinetic: 'glow', animation: 'wave', animationLogic: 'wave', font: 'Orbitron', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none', styleType: 'stroke', strokeColor: '#000000' },
  { id: 'p2', label: 'Royal Flip', category: 'premium', kinetic: 'flipX', animation: 'stagger', animationLogic: 'stagger', font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none', styleType: 'box', bgColor: 'rgba(0,0,0,0.6)' },
  { id: 'p3', label: 'Cyber Glitch', category: 'premium', kinetic: 'glitch', animation: 'random', animationLogic: 'random', font: 'Rubik Glitch', fontPreset: 'tech', fontLogic: 'random', color: '#00D2FF', colorPreset: 'cyan', colorLogic: 'none' },
  { id: 'p4', label: 'Soft Float', category: 'premium', kinetic: 'float', animation: 'fadeUp', animationLogic: 'stagger', font: 'Dancing Script', fontPreset: 'handwritten', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: 'p5', label: 'Impact Bounce', category: 'premium', kinetic: 'scaleBounce', animation: 'bounceIn', animationLogic: 'default', font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FF0000', colorPreset: 'red', colorLogic: 'none', styleType: 'stroke', strokeColor: '#FFFFFF' },
  { id: 'p6', label: 'Minimal Slide', category: 'premium', kinetic: 'slideFromLeft', animation: 'slideRight', animationLogic: 'stagger', font: 'Inter', fontPreset: 'minimal', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'white', colorLogic: 'none' },
  { id: 'p7', label: 'Retro Shake', category: 'premium', kinetic: 'shake', animation: 'wobble', animationLogic: 'random', font: 'Pacifico', fontPreset: 'retro', fontLogic: 'none', color: '#FF6B6B', colorPreset: 'sunset', colorLogic: 'none' },
  { id: 'p8', label: 'Tech Typewriter', category: 'premium', kinetic: 'typewriter', animation: 'charByChar', animationLogic: 'default', font: 'Fira Code', fontPreset: 'mono', fontLogic: 'none', color: '#00FF00', colorPreset: 'green', colorLogic: 'none' },
  { id: 'p9', label: 'Elegant Split', category: 'premium', kinetic: 'splitReveal', animation: 'split', animationLogic: 'edgesIn', font: 'Cinzel', fontPreset: 'formal', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: 'p10', label: 'Bold Pop', category: 'premium', kinetic: 'scalePop', animation: 'centerPop', animationLogic: 'centerOut', font: 'Montserrat', fontPreset: 'bold', fontLogic: 'none', color: '#FF9900', colorPreset: 'orange', colorLogic: 'none' },
  { id: 'p11', label: 'Wave Rainbow', category: 'premium', kinetic: 'wave', animation: 'ripple', animationLogic: 'wave', font: 'Poppins', fontPreset: 'rounded', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'rainbow', colorLogic: 'perWord' },
  { id: 'p12', label: 'Elastic Spring', category: 'premium', kinetic: 'spring', animation: 'elasticIn', animationLogic: 'stagger', font: 'Quicksand', fontPreset: 'casual', fontLogic: 'none', color: '#4ECDC4', colorPreset: 'cyan', colorLogic: 'none' },
  { id: 'p13', label: 'Flash Modern', category: 'premium', kinetic: 'flash', animation: 'zoomIn', animationLogic: 'stagger', font: 'Roboto', fontPreset: 'modern', fontLogic: 'none', color: '#FFFF00', colorPreset: 'yellow', colorLogic: 'none' },
  { id: 'p14', label: 'Ghostly Blur', category: 'premium', kinetic: 'blurIn', animation: 'blurIn', animationLogic: 'random', font: 'Merriweather', fontPreset: 'quote', fontLogic: 'none', color: '#FFFFF0', colorPreset: 'ivory', colorLogic: 'none' },
  { id: 'p15', label: 'Cascade Royal', category: 'premium', kinetic: 'cascade', animation: 'cascade', animationLogic: 'cascade', font: 'Cormorant', fontPreset: 'formal', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: 'p16', label: 'Staggered Glow', category: 'premium', kinetic: 'glow', animation: 'stagger', animationLogic: 'stagger', font: 'Audiowide', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: 'p17', label: 'Flip Slide Duo', category: 'premium', kinetic: 'flipY', animation: 'slideLeft', animationLogic: 'stagger', font: 'Ubuntu', fontPreset: 'sans', fontLogic: 'none', color: '#98FF98', colorPreset: 'mint', colorLogic: 'none' },
  { id: 'p18', label: 'Pulsing Heart', category: 'premium', kinetic: 'heartbeat', animation: 'pulse', animationLogic: 'stagger', font: 'Satisfy', fontPreset: 'handwritten', fontLogic: 'none', color: '#DC143C', colorPreset: 'crimson', colorLogic: 'none' },
  { id: 'p19', label: 'Drifting Smoke', category: 'premium', kinetic: 'float', animation: 'fadeSlide', animationLogic: 'random', font: 'Caveat', fontPreset: 'handwritten', fontLogic: 'none', color: '#E0E0E0', colorPreset: 'silver', colorLogic: 'none' },
  { id: 'p20', label: 'Cosmic Orbit', category: 'premium', kinetic: 'orbit', animation: 'explode', animationLogic: 'random', font: 'Space Grotesk', fontPreset: 'tech', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'ocean', colorLogic: 'perLine' },
  { id: 'p21', label: 'Delayed Rainbow', category: 'premium', kinetic: 'fadeIn', animation: 'wordByWord', animationLogic: 'stagger', animationStartTime: 0.5, animationDuration: 2.0, font: 'Poppins', fontPreset: 'rounded', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'rainbow', colorLogic: 'perWord' },
  { id: 'p22', label: 'Slow Ghost', category: 'premium', kinetic: 'blurIn', animation: 'fadeIn', animationDuration: 3.0, kineticDuration: 3.0, font: 'Merriweather', fontPreset: 'quote', fontLogic: 'none', color: '#FFFFFF', colorPreset: 'silver', colorLogic: 'none', kineticLoop: true },
  { id: 'p23', label: 'Pulse Center Out', category: 'premium', kinetic: 'pulse', animation: 'centerPop', animationLogic: 'centerOut', kineticDuration: 0.5, kineticLoop: true, font: 'Anton', fontPreset: 'display', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: 'p24', label: 'Wobble Sequential', category: 'premium', kinetic: 'wobble', animation: 'staggerUp', animationLogic: 'default', animationDuration: 1.5, kineticDuration: 2.0, font: 'Luckiest Guy', fontPreset: 'display', fontLogic: 'none', color: '#FF69B4', colorPreset: 'pink', colorLogic: 'none' },
  { id: 'p25', label: 'Tech Glitch Loop', category: 'premium', kinetic: 'glitch', animation: 'random', animationLogic: 'random', kineticLoop: true, font: 'Orbitron', fontPreset: 'tech', fontLogic: 'none', color: '#39FF14', colorPreset: 'neon', colorLogic: 'none' },
  { id: 'p26', label: 'Elegant Drift', category: 'premium', kinetic: 'float', animation: 'fadeSlide', animationLogic: 'stagger', animationDuration: 2.5, font: 'Playfair Display', fontPreset: 'elegant', fontLogic: 'none', color: '#C0C0C0', colorPreset: 'silver', colorLogic: 'none' },
  { id: 'p27', label: 'Bounce Matrix', category: 'premium', kinetic: 'scaleBounce', animation: 'staggerDown', animationLogic: 'random', animationDuration: 1.2, kineticDuration: 0.8, font: 'Roboto Mono', fontPreset: 'mono', fontLogic: 'none', color: '#00FF00', colorPreset: 'green', colorLogic: 'none' },
  { id: 'p28', label: 'Royal Wave Loop', category: 'premium', kinetic: 'wave', animation: 'ripple', animationLogic: 'wave', animationDuration: 3.0, kineticLoop: true, font: 'Cinzel', fontPreset: 'formal', fontLogic: 'none', color: '#FFD700', colorPreset: 'gold', colorLogic: 'none' },
  { id: 'p29', label: 'Ghost Typewriter', category: 'premium', kinetic: 'typewriter', animation: 'blurIn', animationLogic: 'stagger', animationDuration: 2.0, kineticDuration: 1.5, font: 'Courier New', fontPreset: 'mono', fontLogic: 'none', color: '#E0E0E0', colorPreset: 'white', colorLogic: 'none' },
  { id: 'p30', label: 'Impact Flash', category: 'premium', kinetic: 'flash', animation: 'zoomIn', animationStartTime: 0.2, animationDuration: 0.5, kineticDuration: 0.3, kineticLoop: true, font: 'Impact', fontPreset: 'impact', fontLogic: 'none', color: '#FF0000', colorPreset: 'red', colorLogic: 'none' },
];

// Default overlay text style fields
export const DEFAULT_TEXT_STYLE = {
  kineticEffect: 'none',
  kineticLogic: 'oneWord',
  fontPreset: 'default',
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontChangeLogic: 'none',
  fontLogic: 'none',
  animationPreset: 'none',
  animationLogic: 'default',
  animationStyle: 'fadeIn',
  colorPreset: 'white',
  color: '#FFFFFF',
  colorLogic: 'none',
  gradientEnabled: false,
  gradientColors: ['#FFFFFF', '#CCCCCC'],
  meaningIconsEnabled: false,
  iconSectionEnabled: false,
  iconLogic: 'none',
  popScale: 1,
  linesPerFrame: 0,
  kineticDuration: 1.0,
  kineticStartTime: 0,
  kineticLoop: false,
  animationDuration: 1.0,
  animationStartTime: 0,
  animationLoop: false,
  wordOverrides: {}, // index -> style object
  lineOverrides: {}, // index -> style object
};


// --- ICON / ELEMENT / GRAPHIC LIBRARY ---

export const ICON_CATEGORIES = [
  { id: 'objects3d', label: '3D Objects' },
  { id: 'vibrant', label: 'Vibrant & Colorful' },
  { id: 'luxury', label: 'Luxury & Premium' },
  { id: 'cosmic', label: 'Cosmic & Space' },
  { id: 'fire_energy', label: 'Fire & Energy' },
  { id: 'crystal_gem', label: 'Crystal & Gems' },
  { id: 'nature_vivid', label: 'Nature (Vivid)' },
  { id: 'emotion', label: 'Emotions' },
  { id: 'tech', label: 'Tech & Gadgets' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'sport', label: 'Sports' },
  { id: 'travel', label: 'Travel' },
  { id: 'business', label: 'Business' },
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'music', label: 'Music & Art' },
  { id: 'animal', label: 'Animals' },
  { id: 'weather', label: 'Weather' },
  { id: 'hand', label: 'Hands & Gestures' },
  { id: 'celebration', label: 'Celebration' },
  { id: 'religion', label: 'Religion' },
  { id: 'flag', label: 'Flags' },
  { id: 'zodiac', label: 'Zodiac' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'fantasy', label: 'Fantasy & Myth' },
  { id: 'royal', label: 'Royal & Crown' },
];

export const ICON_LIBRARY = {
  objects3d: ['🧊','🪩','💎','🔮','🪬','🧿','🪆','🏺','⚱️','🪤','🧲','🔩','⚙️','🛡️','⚔️','🗡️','🪓','🔱','🪝','🧰','🪜','🧳','🎒','👑','💍','📿','🪙','🏅','🥇','🏆','🎲','🎯','🧩','🪁','🎳','🪀','🎰','🎪','🎠','🎡','🎢','🛞','⛽','🛟','⚓','🪝','🧭','⏳','⏰','🕰️','⌚','💣','🧨','🔔','🔕','🎐','🏮','🪔','🧯','🪣','🫧','🪞','🪟','🛋️','🪑','🛏️','🪆','🏺','🫖','🍶','🫗','🧉','🥢','🍽️','🫙','🧊','💠','🔶','🔷'],
  vibrant: ['🌈','🎨','🎭','🎪','🪅','🎠','🎡','🎢','🧧','🪩','🎆','🎇','✨','💫','🌟','⭐','🔥','💥','💢','💦','💧','🫧','🌊','🌀','🌪️','🌈','🦋','🦚','🦜','🐠','🐡','🌺','🌸','🌻','🌷','🌹','💐','🏵️','🎀','🎗️','🎁','🎊','🎉','🎈','💝','💖','💗','💓','💞','💕','❣️','💟','🩷','🩵','🩶','🧡','💛','💚','💙','💜','🤎','🖤','🤍','❤️‍🔥','💎','🪩','🫧','🔮','🧿','💠','🔶','🔷','🟠','🟡','🟢','🔵','🟣','🟤','🔴','⚡','🌠','☄️'],
  luxury: ['👑','💎','💍','🏆','🥇','🎖️','🪙','💰','💵','💴','💶','💷','💸','💳','🏷️','💹','📊','📈','🥂','🍾','🥃','🍷','🫗','🏰','🏛️','🗽','🕌','⛪','🏯','🎭','🖼️','🎨','⚜️','🔱','👔','👗','👠','👟','👜','🕶️','💄','💅','🛍️','🎩','🪭','📿','⌚','🪬','🧿','🔮','🕰️','🪞','🛋️','🏺','🫖','✒️','🖋️','📜','🗝️','🔐','🛡️','⚔️','🗡️'],
  cosmic: ['🌌','🌠','🪐','🌍','🌎','🌏','🌙','🌛','🌜','🌝','🌞','☀️','⭐','🌟','✨','💫','☄️','🔭','🛸','🚀','🛰️','👽','👾','🤖','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌚','💎','🔮','🌀','🕳️','⚡','🔥','❄️','💠','♾️','⚛️','🧬','🔬','🌈','🎆','🎇','🌊','🫧','💧','🧊','🪩','✨','💥'],
  fire_energy: ['🔥','⚡','💥','💢','❤️‍🔥','☄️','🌋','🌪️','⛈️','🌩️','💫','✨','🌟','⭐','🔆','🔅','💡','🕯️','🪔','🧨','💣','🎆','🎇','🔴','🟠','🟡','🧡','❤️','💛','🫀','💪','👊','✊','🤛','🤜','🏋️','🚀','🏎️','⚔️','🗡️','🔱','🛡️','🎯','🏆','🥇','💯','📈','🆙','⏫','🔝','♨️','🌡️','☢️','⚠️','🚨','📣','📢','🔔'],
  crystal_gem: ['💎','🔮','🪩','💠','🧿','🪬','🌈','✨','💫','🌟','⭐','🔆','🧊','❄️','🫧','💧','💦','🌊','🪸','🐚','🦪','🐌','🪶','🦋','🌺','🌸','💐','🏵️','🪷','💍','📿','🪙','👑','🏅','🥇','🎖️','⚜️','🔱','💜','💙','💚','💛','🩷','🩵','🤍','🩶','🔵','🟣','🟢','🟡','🔴','🟠','🔶','🔷','🔸','🔹','🔺','🔻','♦️'],
  nature_vivid: ['🌺','🌸','🌻','🌹','🌷','💐','🪷','🌼','🏵️','🪻','🍀','☘️','🌿','🌱','🎋','🎍','🍁','🍂','🍃','🌲','🌳','🌴','🎄','🌵','🌾','🪴','🍄','🪨','🪵','🐚','🪸','🌊','💧','💦','☔','🌈','☀️','🌤️','🌅','🌄','🌇','🌆','🏔️','⛰️','🗻','🌋','🏝️','🏜️','🏞️','🦋','🐝','🐞','🪲','🐛','🐌','🦗','🪱','🕷️','🦂','🐢','🦎','🐍','🦖','🦕','🐊','🐉','🐲','🪿','🦢','🦩','🦚','🦜','🐦‍🔥','🕊️','🦅','🦆','🐧','🦉','🐸','🌙','⭐','🌟','✨'],
  emotion: ['😊','😄','😁','😆','😂','🤣','😍','🥰','😘','🤩','🥳','😎','🤑','🤗','😇','🥹','🫠','🫡','🫢','🤭','🫣','🤫','🤔','🧐','🤓','😏','😌','😴','🥱','😪','🤤','😋','😛','😜','😝','🤪','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','😶‍🌫️','🫥','😬','🤥','😌','😈','👿','💀','☠️','👻','👽','🤖','💩','🫶','❤️‍🔥','💔','❤️‍🩹','💯','💢','💥','💫','💦','💨','🕳️','🗯️','💬','💭','🗨️'],
  tech: ['💻','🖥️','🖨️','⌨️','🖱️','📱','📲','🔋','🔌','💡','🔦','💿','📀','📡','🔬','🔭','📺','📻','⚙️','🔧','🔩','🛠️','💾','📸','📷','🎥','📹','🎬','🎮','🕹️','🤖','🦾','🦿','🧬','⚡','🔗','🌐','📶','🛰️','💎','🔮','🪬','🧿','📱','🖲️','💠','🧲','🧰','🛞','⛽','🪫','🔌','🪝','📐','📏','🧮','⚗️','🧪','🔬','🔭'],
  food: ['🍕','🍔','🍟','🌭','🥪','🌮','🌯','🥙','🧆','🍳','🥘','🍲','🥣','🥗','🍿','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍞','🧇','🥞','🧀','🍖','🍗','🥩','🥓','🥚','🥐','🥖','🍰','🎂','🧁','🥧','🍮','🍦','🍧','🍨','🍩','🍪','🍫','🍬','🍭','🍯','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥦','🧄','🧅','🍄','☕','🍵','🥤','🧃','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧋','🫖','🧊'],
  sport: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🏏','🥅','⛳','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','⛸️','🎿','🏂','🪂','🏋️','🤸','🤺','⛹️','🤾','🏊','🚴','🏇','🏆','🥇','🥈','🥉','🏅','🎖️','🏃','🧗','🚣','🤼','🤽','🤹','🎯','🏎️','🏍️','🤺','💪'],
  travel: ['✈️','🛩️','🚀','🛸','🚁','🛶','⛵','🚤','🛳️','🚢','🚂','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚋','🚌','🚐','🚑','🚒','🚓','🚕','🚗','🚙','🛻','🚚','🚛','🏎️','🏍️','🛵','🚲','🛴','🗺️','🧭','🏠','🏡','🏢','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌉','🗿','🗻','🏔️','⛰️','🏝️','🏖️'],
  business: ['💼','👔','📊','📈','📉','💹','💰','💵','💴','💶','💷','💸','💳','🧾','💲','🏷️','🏦','🏢','📋','📌','📎','🖇️','✏️','🖊️','🖋️','✒️','📝','📁','📂','🗂️','🗃️','🗄️','📅','📆','🗓️','📇','📨','📧','📬','📮','📦','📯','🤝','📣','📢','🔑','🗝️','🔐','🔏','💡','⚙️'],
  education: ['📚','📖','📕','📗','📘','📙','📓','📒','📔','📃','📜','📄','📑','🔖','🎓','🏫','✏️','✒️','🖊️','🖋️','📝','📐','📏','📌','🔍','🔎','🧪','🔬','🔭','🧲','🧮','📡','💻','🖥️','🗺️','🌐','💡','📋','🎒','📰','🏆','🎯','🧠','🎪','🧬','⚗️','🔬','🔭','📊','💭'],
  health: ['❤️','🧡','💛','💚','💙','💜','🤍','❤️‍🔥','❤️‍🩹','💔','💕','💗','💖','💘','💝','🏥','💊','💉','🩺','🩹','🩻','🦷','👁️','🧬','🩸','🫀','🫁','🧠','🦴','👨‍⚕️','👩‍⚕️','🧘','🏃','🚴','🏊','🥗','🍎','💪','🦾','🧑‍🦽','♿','🚑','⚕️','🔬','🩷','🫶','🌡️','😷','🤧','🤒'],
  music: ['🎵','🎶','🎼','🎹','🎸','🎺','🎷','🪗','🥁','🪘','🎻','🎤','🎧','🎙️','📯','📻','🎚️','🎛️','🎬','🎭','🎨','🖌️','🖍️','🎪','🎩','🪄','🎰','🎲','🎯','🧩','🪅','🪆','🖼️','🎟️','🎫','🎗️','🏮','🎀','🎊','🎉','🎈','🎏','🎐','🧸','🪩','💃','🕺','🪈','🪇'],
  animal: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐦‍🔥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐎','🦙','🐐','🦌','🐕','🐩','🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐿️','🦔','🐉','🐲','🪿','🫏','🐦‍🔥'],
  weather: ['☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌈','🌊','💧','💦','☔','⚡','🌡️','🔥','☄️','🌙','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','⭐','🌟','✨','🌠','💫','🫧'],
  hand: ['👍','👎','👊','✊','🤛','🤜','👏','🙌','🤲','🤝','🙏','✌️','🤞','🤟','🤘','🤙','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✍️','🤳','💪','🦾','☝️','👆','👇','👈','👉','🫵','🫱','🫲','🫳','🫴','🫰','🫶','👐','💅','🤷','🤦','🙋','🙆','🙅','💁','🙇'],
  celebration: ['🎉','🎊','🎈','🎀','🎁','🎂','🧁','🎆','🎇','🧨','✨','🎍','🎎','🎏','🎐','🎑','🎃','🎄','🎋','🎗️','🎟️','🎫','🏆','🏅','🥇','🥈','🥉','🎖️','🎪','🤹','🎭','🥳','🪅','🪆','🪩','🎯','🎰','🎲','🏮','🧧','💐','🍾','🥂','🪄','🎩'],
  religion: ['🙏','📿','🕉️','☸️','✡️','🔯','🕎','☪️','✝️','☦️','☮️','🕌','🛕','⛪','🕍','⛩️','🕋','🤲','😇','👼','🪬','📖','🕊️','🔔','🕯️','⚱️','🪦','🛐','📿','⛎'],
  flag: ['🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇮🇳','🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇯🇵','🇰🇷','🇨🇳','🇩🇪','🇫🇷','🇮🇹','🇪🇸','🇧🇷','🇷🇺','🇲🇽','🇦🇪','🇸🇦','🇹🇷','🇿🇦','🇳🇬','🇵🇰','🇧🇩','🇮🇩','🇹🇭','🇻🇳','🇵🇭','🇪🇬','🇰🇪','🇦🇷','🇨🇴','🇨🇱','🇵🇪','🇳🇿','🇸🇬','🇲🇾','🇳🇵','🇱🇰'],
  zodiac: ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','🌙','☀️','⭐','🌟','🔮','🪐','✨','💫','🌌','🌠','🌑','🌕','🧿'],
  gaming: ['🎮','🕹️','👾','🤖','🎲','🎯','🃏','🀄','🎰','🎳','🏆','🥇','🏅','🎖️','⚔️','🗡️','🛡️','🏹','🔫','💣','🧨','🪄','🎩','👑','💎','🔮','🪬','🧿','🌀','💥','⚡','🔥','❄️','💧','🌊','🌪️','☄️','🕳️','💫','✨','🌟','⭐','🏴‍☠️','🚩','🏁'],
  fantasy: ['🐉','🐲','🦄','🧙','🧙‍♀️','🧙‍♂️','🧝','🧝‍♀️','🧝‍♂️','🧚','🧚‍♀️','🧚‍♂️','🧜','🧜‍♀️','🧜‍♂️','🧞','🧞‍♀️','🧞‍♂️','🧛','🧛‍♀️','🧛‍♂️','🧟','🧟‍♀️','🧟‍♂️','👻','💀','☠️','👽','👾','🤖','🦸','🦸‍♀️','🦸‍♂️','🦹','🦹‍♀️','🦹‍♂️','🪄','🔮','🗡️','⚔️','🛡️','🏹','👑','💎','💍','🪬','🧿','✨','💫','🌟','⭐','🔥','❄️','⚡','🌀','🕳️','🐦‍🔥'],
  royal: ['👑','💎','💍','🏆','🥇','🏅','🎖️','⚜️','🔱','🗡️','⚔️','🛡️','🏰','🏛️','🏯','👸','🤴','🫅','🤵','👗','👠','🥿','👜','🧤','🪭','🎩','🎪','🏇','🐎','🦁','🐺','🦅','🦚','📿','🪬','💰','💵','💸','🍾','🥂','🕰️','🪞','🖼️','📜','✒️','🖋️','🗝️','🔐','🛋️','🏺'],
};

export const ELEMENT_LIBRARY = {
  arrows_3d: ['➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↩️','↪️','⤴️','⤵️','🔄','🔃','🔁','🔂','⏩','⏪','⏫','⏬','▶️','◀️','🔼','🔽','⏭️','⏮️','🫸','🫷','👉','👈','👆','👇','☝️','🫵','➰','➿','🔀'],
  shapes_vibrant: ['🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','♦️','♠️','♣️','♥️','🃏','⭕','❗','❓','❕','❔','‼️','⁉️','💯','🔘','🔲','🔳','▪️','▫️','◼️','◻️','◾','◽','⬛','⬜','🟥','🟧','🟨','🟩','🟦','🟪','🟫'],
  stars_sparkle: ['⭐','🌟','✨','💫','🔆','🔅','☀️','🌤️','🌙','💎','🔮','🪩','✡️','🔯','✳️','❇️','🌠','☄️','🎇','🎆','💥','🌀','❄️','🏵️','⚜️','🔱','💠','🌈','🎯','🧿','🪬','⚡','🔥','💧','🌊','🫧'],
  decorative: ['✿','❀','❁','❃','❋','✾','✽','✼','❊','❉','❈','❆','❅','❄','✻','✺','✹','✸','✷','✶','✵','✴','✳','✲','✱','✰','✯','✮','✭','✬','✫','✪','✩','✧','✦','✥','✤','✣','✢','⁕','⁑','⁂','☘','⚜','🏵','♾️','⚛️','☯️','☮️','♻️'],
  brackets_fancy: ['【','】','〖','〗','〔','〕','《','》','「','」','『','』','〈','〉','⟨','⟩','⟪','⟫','⌈','⌉','⌊','⌋','❝','❞','❮','❯','❰','❱','〝','〞','﹃','﹄','﹁','﹂','『','』'],
  dividers_rich: ['═','━','─','│','┃','▬','▰','▱','╌','╍','╎','╏','┄','┅','┆','┇','—','–','⎯','⸺','⸻','᎐','᎑','╶','╸','╺','╼'],
  math: ['∞','≈','≠','≤','≥','±','×','÷','∑','∏','∫','√','∝','∂','∇','∆','∅','∈','∉','⊂','⊃','⊆','⊇','∪','∩','∧','∨','¬','⊥','∥','∠','°','π','φ','Ω','µ','λ','σ','θ','ε'],
  currency: ['💲','💰','💵','💴','💶','💷','💸','💳','🪙','$','€','£','¥','₹','₽','₿','¢','₩','₦','₫','₺','₱','₵','₸','₼','₾','฿'],
  checkmarks: ['✅','☑️','✔️','✓','❌','❎','✗','✘','⭕','🔴','🟢','🔵','💯','👍','👎','🙌','👏','💪','🔥','⚡','✨','💎','🏆','🎯'],
  borders_3d: ['╔','╗','╚','╝','╠','╣','╦','╩','╬','╭','╮','╯','╰','┏','┓','┗','┛','┣','┫','┳','┻','╋','┌','┐','└','┘','├','┤','┬','┴','┼'],
};

export const GRAPHIC_LIBRARY = {
  dividers_vibrant: ['✨═══════✨','🔥━━━━━━━🔥','💎───────💎','⭐·····⭐·····⭐','🌟═══════🌟','⚡━━━━━━━⚡','💫·✦·✦·✦·✦·💫','🌈═══════🌈','❤️‍🔥━━━━━━❤️‍🔥','💎✧═══✧💎','🔮···════···🔮','👑━━━━━━━👑','💥═══════💥','🏆───────🏆'],
  dividers_classic: ['═══════════','───────────','━━━━━━━━━━━','✦✦✦✦✦✦✦✦✦✦✦','★·★·★·★·★·★','✿·✿·✿·✿·✿·✿','❖···❖···❖···❖','◆◇◆◇◆◇◆◇◆◇◆','⊱✿⊰','⊹⊱✿⊰⊹','⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆','✧✧✧✧✧✧✧✧✧✧✧','─·─·─·─·─·─','▸▸▸▸▸▸▸▸▸▸▸'],
  badges_3d: ['🔥【★】🔥','💎〖✦〗💎','👑〔❖〕👑','✨《✿》✨','⚡「♦」⚡','🌟『●』🌟','💫⟦◆⟧💫','🏆⟨★⟩🏆','💥⌈✧⌋💥','🔮⸢❀⸥🔮','❤️‍🔥[✓]❤️‍🔥','⭐(★)⭐','💎<✦>💎'],
  badges_classic: ['【★】','〖✦〗','〔❖〕','《✿》','「♦」','『●』','⟦◆⟧','⟨★⟩','⌈✧⌋','⸢❀⸥','[✓]','(★)','<✦>','{❖}','|●|'],
  banners_3d: ['🔥═══ TEXT ═══🔥','💎──── TEXT ────💎','👑━━━━ TEXT ━━━━👑','✨✦═══ TEXT ═══✦✨','⭐★─── TEXT ───★⭐','💫❖━━━ TEXT ━━━❖💫','⚡◆··· TEXT ···◆⚡','🏆▸▸▸ TEXT ◂◂◂🏆'],
  banners_classic: ['═══╡ TEXT ╞═══','──── TEXT ────','━━━━ TEXT ━━━━','✦═══ TEXT ═══✦','★─── TEXT ───★','❖━━━ TEXT ━━━❖','◆··· TEXT ···◆','⊱ TEXT ⊰','✧ TEXT ✧','« TEXT »','‹ TEXT ›','⟪ TEXT ⟫'],
  ornamental_3d: ['👑⚜️👑','💎✨💎','🔥⭐🔥','🌟💫🌟','💥⚡💥','🔮🌀🔮','🏆🥇🏆','❤️‍🔥💖❤️‍🔥','🌈✨🌈','💎🔱💎','👑🗡️⚔️🛡️👑','🔥🐉🔥','💫🦅💫','⭐🦁⭐','🌟🐺🌟'],
  ornamental_classic: ['꧁','꧂','꧁༺','༻꧂','✧═══✧','❈═══❈','⊱✿⊰','꧁⊱✿⊰꧂','❧','☙','❦','❥','✾','❁','⚜','☘','❂','✤','❋','✣','✥','✺','✻','✼','✽'],
  emoji_combos: ['🔥💯🔥','⚡💪⚡','✨🌟✨','💎👑💎','🚀🌟🚀','💥⭐💥','🏆🥇🏆','❤️‍🔥💖❤️‍🔥','🌈🦋🌈','🎯🔥🎯','💫🔮💫','⚡🏆⚡','🌊🐬🌊','🌸🌺🌸','🎵🎶🎵','🍕🍔🍕','☕🍩☕','📚🎓📚','💰📈💰','🎮🕹️🎮'],
  accent_marks: ['·','•','●','○','◉','◎','★','☆','✦','✧','❖','✿','❀','❁','❃','❋','✾','✽','⁂','⊹','⊰','⊱','✥','✤','✣','✢','⊕','⊗','⊙','⊚','⊛','☸','⚙','⚛','✡','✝','☪','☯','☮','♾','⚜','♠','♣','♥','♦','♤','♧','♡','♢'],
};

const INTENT_ICON_MAP = {
  love: ['❤️‍🔥','😍','🥰','😘','💕','💗','💖','💘','💝','💞','💓','🩷','💟','♥️','💑','💏','🫶','💐','🌹','🫀','💍','🥂','🎀','✨'],
  happy: ['😊','😄','😁','😆','🥳','🤩','😎','🎉','✨','🌟','💫','🎊','🌈','☀️','🎆','🎇','💥','🔥','🙌','💯','🪩','🎭','🕺','💃'],
  sad: ['😢','😭','😞','😔','💔','🥺','😿','😥','😰','🌧️','☔','💧','🫠','😶‍🌫️','🖤','🕳️'],
  angry: ['😠','😡','🤬','💢','👊','😤','🔥','⚡','💥','👿','😈','💀','☠️','🌋','⚔️','🗡️'],
  fear: ['😱','😨','😰','😧','👻','💀','☠️','🫣','😬','🙀','🕳️','🌑','🦇','🕷️','🐍','👾'],
  motivational: ['💪','🔥','🚀','🏆','⭐','🌟','✨','🎯','💯','🙌','👊','🏅','🥇','📈','💎','👑','🦁','⚡','💥','🐉','❤️‍🔥','🔱','🛡️','⚔️'],
  nature: ['🌿','🌺','🌸','🌻','🌹','🌳','🌊','🏔️','🌈','☀️','🌙','⭐','🍀','🌱','🦋','🌷','💐','🪷','🐚','🌅','🏝️','🌴','🐦‍🔥','✨'],
  tech: ['💻','📱','⚡','🤖','🔧','⚙️','🛠️','💡','🔌','📡','🌐','💾','🖥️','🦾','🦿','🧬','🔬','🛰️','🎮','🕹️','💎','🔮','🪬','📶'],
  food: ['🍕','🍔','🍟','🍰','🍎','☕','🍩','🍫','🥗','🍳','🥤','🍿','🍜','🍣','🌮','🥪','🧁','🍦','🍉','🥂','🍷','🍺','🧋','🫖'],
  money: ['💰','💵','💸','📈','🏦','💳','🤑','💲','📊','💹','🏷️','💎','👑','🪙','💍','🥇','🏆','📈','🔥','⚡','🚀','💫','✨'],
  education: ['📚','🎓','📖','✏️','📝','🔬','💡','🧠','📐','🎯','🏫','📋','🔍','🧪','🔭','🧬','💻','🌐','🏆','🥇','🎖️','✨','💫','📊'],
  health: ['❤️‍🩹','💊','🏥','🩺','💪','🧘','🏃','🥗','🍎','🧬','🩹','⚕️','🫀','🫁','🧠','🦴','🩷','🌡️','😷','💉','🦷','🩻','🌿','🧊'],
  music: ['🎵','🎶','🎸','🎹','🎤','🎧','🎼','🎺','🎷','🥁','🎻','🎙️','🪩','💃','🕺','🎭','🎬','🎨','🪗','🎚️','🎛️','📯','🎪','✨'],
  travel: ['✈️','🌍','🗺️','🏖️','🏝️','⛰️','🚗','🚀','🧭','🎒','⛺','🏕️','🌅','🌄','🗽','🏰','🗼','🌃','🏙️','🌉','🛳️','🛸','🚁','🏔️'],
  sport: ['⚽','🏀','🏈','🎾','🏆','🥇','🏃','💪','🎯','🥊','🏊','🚴','🏎️','⚡','🔥','🏅','🥈','🥉','🤸','🏋️','⛹️','🏂','🎿','🤺'],
  celebration: ['🎉','🎊','🎈','🎂','🥳','🎁','🎆','🎇','🏆','🥂','✨','🎀','🪩','💃','🕺','🎭','🍾','🎪','🤹','🎰','🧧','🏮','💫','🔥'],
  religion: ['🙏','📿','🕉️','☪️','✝️','☸️','😇','👼','🕊️','🔔','🕯️','📖','🪬','🧿','🛕','🕌','⛪','⛩️','🕋','🕍','✡️','🔯','☮️','🤲'],
  warning: ['⚠️','❗','🚨','⛔','🔴','❌','💀','☠️','🚫','⚡','🔥','💥','🌋','🌪️','☢️','☣️','💣','🧨','⛈️','🆘'],
  question: ['❓','🤔','💭','🧐','🔍','❔','💡','🤷','📌','🔎','🧩','🧮','📊','🎯','🔮','🪬'],
  time: ['⏰','⏱️','⏳','🕐','📅','📆','🗓️','⏲️','🔔','⌛','🕰️','⌚','🌅','🌄','🌙','☀️','🌞','🌝','🕛','🕧'],
  success: ['✅','🏆','🎯','💯','🥇','👍','🌟','⭐','🎉','🏅','📈','💎','👑','🔥','⚡','🚀','💪','🙌','🎆','🎇','💫','✨','❤️‍🔥'],
  family: ['👨‍👩‍👧‍👦','👨‍👩‍👧','👪','🏠','🏡','❤️','🤝','👶','👧','👦','🧒','🫶','💖','🏡','👨‍👩‍👦','👩‍👧','👨‍👦','🤱','🧑‍🍼'],
};

const INTENT_KEYWORDS = {
  love: ['love','heart','romance','romantic','dil','pyaar','ishq','mohabbat','kiss','hug','darling','sweetheart','beloved','valentine','crush','dating','marry','wedding','bride','groom','couple'],
  happy: ['happy','joy','smile','laugh','celebrate','fun','enjoy','cheer','glad','merry','bliss','delight','pleasant','wonderful','amazing','awesome','fantastic','great','good','best','excellent','superb','brilliant'],
  sad: ['sad','cry','tears','pain','hurt','miss','alone','lonely','broken','grief','sorrow','unhappy','depressed','miserable','tragic','heartbreak','loss','suffer'],
  angry: ['angry','rage','furious','mad','hate','fight','destroy','attack','battle','war','punch','kick','violent','aggressive','frustrate'],
  fear: ['fear','scary','horror','terrify','ghost','dark','nightmare','creepy','spooky','afraid','panic','danger','threat','risk'],
  motivational: ['strong','power','success','achieve','goal','dream','never give up','winner','champion','believe','courage','brave','inspire','motivation','hard work','hustle','grind','rise','conquer','unstoppable','limitless'],
  nature: ['nature','tree','flower','garden','forest','mountain','river','ocean','sea','sky','sun','moon','star','rain','snow','wind','earth','planet','green','beautiful','bloom','spring','summer','autumn','winter'],
  tech: ['technology','computer','phone','internet','code','software','app','digital','data','ai','robot','machine','server','cloud','network','programming','hack','cyber','web','online'],
  food: ['food','eat','cook','recipe','meal','breakfast','lunch','dinner','snack','pizza','burger','cake','fruit','vegetable','drink','coffee','tea','delicious','tasty','yummy','hungry','restaurant'],
  money: ['money','rich','wealth','earn','income','salary','business','profit','invest','bank','finance','budget','save','spend','price','cost','expensive','cheap','dollar','rupee','crypto','stock','market'],
  education: ['learn','study','school','college','university','teacher','student','book','read','write','exam','test','knowledge','science','math','history','research','diploma','degree','course','class','lesson'],
  health: ['health','doctor','hospital','medicine','sick','disease','cure','treatment','exercise','yoga','meditation','fitness','diet','nutrition','vitamin','immune','mental','body','mind','wellness','heal'],
  music: ['music','song','sing','dance','guitar','piano','drum','band','concert','melody','rhythm','beat','tune','lyric','album','rap','rock','pop','jazz','classical'],
  travel: ['travel','trip','journey','adventure','explore','visit','tour','flight','hotel','beach','island','city','country','world','passport','vacation','holiday','destination','backpack','road'],
  sport: ['sport','game','play','team','match','score','goal','win','race','run','swim','football','cricket','basketball','tennis','gym','athlete','competition','tournament','fitness'],
  celebration: ['celebrate','party','birthday','anniversary','wedding','festival','new year','christmas','diwali','eid','holi','congratulations','cheers','toast','gift','surprise','firework'],
  religion: ['god','prayer','temple','mosque','church','faith','bless','divine','spiritual','soul','heaven','holy','sacred','worship','devotion','guru','saint','angel','miracle','peace','namaz','puja','bhagwan','allah','jesus','ram','krishna'],
  warning: ['warning','danger','alert','caution','risk','emergency','urgent','critical','beware','stop','ban','prohibit','restrict'],
  question: ['why','how','what','when','where','who','which','whose','whom','question','ask','wonder','curious','doubt','confused','think','consider','ponder'],
  time: ['time','clock','hour','minute','second','morning','evening','night','today','tomorrow','yesterday','week','month','year','schedule','deadline','late','early','soon','now','forever','always','never'],
  success: ['success','achieve','accomplish','complete','finish','done','pass','win','top','best','first','medal','trophy','award','rank','promotion','progress','milestone','breakthrough','victory'],
  family: ['family','mother','father','sister','brother','son','daughter','baby','child','parent','mom','dad','maa','papa','bhai','behen','beta','beti','husband','wife','grandma','grandpa','uncle','aunt'],
};

export function getIntentFromText(text) {
  if (!text) return null;
  const lower = String(text).toLowerCase();
  let bestIntent = null;
  let bestScore = 0;
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) { bestScore = score; bestIntent = intent; }
  }
  return bestIntent;
}

export function getIconForIntent(intent, index = 0) {
  const icons = INTENT_ICON_MAP[intent];
  if (!icons || icons.length === 0) return null;
  return icons[index % icons.length];
}

export function getIconForWord(word, iconSourceType = 'icons') {
  const w = String(word).toLowerCase().replace(/[^\w]/g, '');
  if (iconSourceType === 'elements') {
    const shortElements = Object.values(ELEMENT_LIBRARY).flat().filter(e => e.length <= 3);
    if (shortElements.length === 0) return '✦';
    const hash = w.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return shortElements[hash % shortElements.length];
  }
  if (iconSourceType === 'graphics') {
    const shortGraphics = Object.values(GRAPHIC_LIBRARY).flat().filter(g => g.length <= 5);
    if (shortGraphics.length === 0) return '❖';
    const hash = w.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return shortGraphics[hash % shortGraphics.length];
  }
  return MEANING_ICONS[w] || MEANING_ICONS[Object.keys(MEANING_ICONS).find(k => w.includes(k))] || null;
}

export const ICON_ANIMATION_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'fadeIn', label: 'Fade In' },
  { id: 'scaleUp', label: 'Scale Up' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'spin', label: 'Spin' },
  { id: 'slideLeft', label: 'Slide Left' },
  { id: 'slideRight', label: 'Slide Right' },
  { id: 'slideUp', label: 'Slide Up' },
  { id: 'slideDown', label: 'Slide Down' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'pop', label: 'Pop' },
  { id: 'float', label: 'Float' },
  { id: 'shake', label: 'Shake' },
  { id: 'glow', label: 'Glow' },
];

export const ICON_POSITION_PRESETS = [
  { id: 'beforeWord', label: 'Before Word' },
  { id: 'afterWord', label: 'After Word' },
  { id: 'aboveWord', label: 'Above Word' },
  { id: 'belowWord', label: 'Below Word' },
  { id: 'topLeft', label: 'Top-Left Corner' },
  { id: 'topRight', label: 'Top-Right Corner' },
  { id: 'bottomLeft', label: 'Bottom-Left Corner' },
  { id: 'bottomRight', label: 'Bottom-Right Corner' },
  { id: 'center', label: 'Center' },
];

// Color palette for color logic cycling
const COLOR_PALETTE = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9FF3', '#48DBFB', '#1DD1A1', '#FECA57', '#FF6348', '#2ED573', '#FFC312'];

export function getColorForIndex(baseColor, logic, index, total = 1) {
  if (!logic || logic === 'none') return baseColor;
  const idx = Math.min(index, COLOR_PALETTE.length - 1);
  if (logic === 'random') return COLOR_PALETTE[(index * 7919) % COLOR_PALETTE.length];
  if (logic === 'oddEven') return index % 2 === 0 ? baseColor : COLOR_PALETTE[idx % COLOR_PALETTE.length];
  if (logic === 'firstWord') return index === 0 ? baseColor : '#FFFFFF';
  if (logic === 'lastWord') return index === total - 1 ? baseColor : '#FFFFFF';
  if (['perWord', 'perLine', 'everyTwo', 'everyThree', 'segment', 'gradientCycle', 'rainbow'].includes(logic)) {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  }
  return baseColor;
}

// Font selection for font logic (per word/line cycling)
export function getFontForIndex(baseFont, logic, index, total = 1) {
  if (!logic || logic === 'none') return baseFont;
  
  // Pick more distinct/interesting fonts for variety
  const interestingFonts = [
    'Montserrat', 'Bebas Neue', 'Playfair Display', 'Orbitron', 'Pacifico', 
    'Dancing Script', 'Impact', 'Roboto', 'Oswald', 'Cinzel', 
    'Luckiest Guy', 'Lobster', 'Caveat', 'Anton', 'Audiowide', 
    'Press Start 2P', 'Satisfy', 'Righteous', 'Bungee', 'Pixelify Sans'
  ];
  
  const fontIdx = index % interestingFonts.length;
  if (logic === 'random') return interestingFonts[(index * 7919) % interestingFonts.length];
  if (logic === 'oddEven') return index % 2 === 0 ? baseFont : interestingFonts[fontIdx];
  
  if (['perWord', 'perLine', 'everyTwo', 'everyThree', 'everyFour', 'perSegment', 'cycle2', 'cycle3', 'cycle5', 'alternate', 'groupStyle'].includes(logic)) {
    if (logic === 'cycle2') return interestingFonts[index % 2];
    if (logic === 'cycle3') return interestingFonts[index % 3];
    if (logic === 'cycle5') return interestingFonts[index % 5];
    if (logic === 'everyTwo') return interestingFonts[Math.floor(index / 2) % interestingFonts.length];
    if (logic === 'everyThree') return interestingFonts[Math.floor(index / 3) % interestingFonts.length];
    if (logic === 'everyFour') return interestingFonts[Math.floor(index / 4) % interestingFonts.length];
    if (logic === 'perLine') return interestingFonts[index % interestingFonts.length];
    return interestingFonts[index % interestingFonts.length];
  }
  
  if (logic === 'firstWord') return index === 0 ? interestingFonts[1] : baseFont;
  if (logic === 'lastWord') return index === total - 1 ? interestingFonts[1] : baseFont;
  if (logic === 'emphasis') return (index === Math.floor(total / 2)) ? interestingFonts[2] : baseFont;
  
  return baseFont;
}

// ============= TEXT BACKGROUND PATTERNS & DOODLES =============

export const TEXT_BG_PATTERN_CATEGORIES = [
  { id: 'gradient', label: 'Gradients' },
  { id: 'solid', label: 'Solid Vibrant' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'organic', label: 'Organic' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'glass', label: 'Glass / Blur' },
  { id: 'metallic', label: 'Metallic' },
  { id: 'nature', label: 'Nature Tones' },
  { id: 'retro', label: 'Retro / Vintage' },
  { id: 'dark', label: 'Dark Premium' },
];

export const TEXT_BG_PATTERNS = {
  gradient: [
    { id: 'sunset', label: 'Sunset', colors: ['#FF6B6B','#FFE66D'], angle: 135 },
    { id: 'ocean', label: 'Ocean', colors: ['#667eea','#764ba2'], angle: 135 },
    { id: 'forest', label: 'Forest', colors: ['#11998e','#38ef7d'], angle: 135 },
    { id: 'fire', label: 'Fire', colors: ['#f12711','#f5af19'], angle: 135 },
    { id: 'purple_rain', label: 'Purple Rain', colors: ['#7F00FF','#E100FF'], angle: 135 },
    { id: 'sky', label: 'Sky Blue', colors: ['#2196F3','#00BCD4'], angle: 180 },
    { id: 'peach', label: 'Peach', colors: ['#ffecd2','#fcb69f'], angle: 135 },
    { id: 'aurora', label: 'Aurora', colors: ['#00d2ff','#3a7bd5','#7B68EE'], angle: 135 },
    { id: 'candy', label: 'Candy', colors: ['#ff6a88','#ff99ac','#fcb69f'], angle: 135 },
    { id: 'rainbow', label: 'Rainbow', colors: ['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#9400D3'], angle: 90 },
    { id: 'gold_shine', label: 'Gold Shine', colors: ['#BF953F','#FCF6BA','#B38728','#FBF5B7'], angle: 135 },
    { id: 'silver_glow', label: 'Silver Glow', colors: ['#C0C0C0','#E8E8E8','#A9A9A9','#D3D3D3'], angle: 135 },
    { id: 'emerald', label: 'Emerald', colors: ['#009245','#FCEE21'], angle: 135 },
    { id: 'midnight', label: 'Midnight', colors: ['#0f0c29','#302b63','#24243e'], angle: 135 },
    { id: 'neon_pink', label: 'Neon Pink', colors: ['#f953c6','#b91d73'], angle: 135 },
    { id: 'ice', label: 'Ice', colors: ['#e0eafc','#cfdef3'], angle: 135 },
  ],
  solid: [
    { id: 's_red', label: 'Red', colors: ['#FF0000'], angle: 0 },
    { id: 's_blue', label: 'Blue', colors: ['#0066FF'], angle: 0 },
    { id: 's_green', label: 'Green', colors: ['#00CC00'], angle: 0 },
    { id: 's_yellow', label: 'Yellow', colors: ['#FFD700'], angle: 0 },
    { id: 's_orange', label: 'Orange', colors: ['#FF6600'], angle: 0 },
    { id: 's_purple', label: 'Purple', colors: ['#9933FF'], angle: 0 },
    { id: 's_pink', label: 'Pink', colors: ['#FF69B4'], angle: 0 },
    { id: 's_cyan', label: 'Cyan', colors: ['#00FFFF'], angle: 0 },
    { id: 's_lime', label: 'Lime', colors: ['#32CD32'], angle: 0 },
    { id: 's_coral', label: 'Coral', colors: ['#FF7F50'], angle: 0 },
    { id: 's_teal', label: 'Teal', colors: ['#008080'], angle: 0 },
    { id: 's_magenta', label: 'Magenta', colors: ['#FF00FF'], angle: 0 },
  ],
  geometric: [
    { id: 'geo_dots', label: 'Dots', type: 'dots', colors: ['#1a1a2e','#e94560'], angle: 0 },
    { id: 'geo_grid', label: 'Grid', type: 'grid', colors: ['#0d1117','#58a6ff'], angle: 0 },
    { id: 'geo_diagonal', label: 'Diagonal', type: 'diagonal', colors: ['#1a1a2e','#16213e','#0f3460'], angle: 45 },
    { id: 'geo_checker', label: 'Checker', type: 'checker', colors: ['#1a1a2e','#2a2a4e'], angle: 0 },
    { id: 'geo_hexagon', label: 'Hexagon', type: 'hexagon', colors: ['#0d1117','#21262d','#58a6ff'], angle: 0 },
    { id: 'geo_triangle', label: 'Triangles', type: 'triangles', colors: ['#2c3e50','#3498db','#e74c3c'], angle: 0 },
    { id: 'geo_wave', label: 'Waves', type: 'waves', colors: ['#1a1a2e','#4361ee'], angle: 0 },
    { id: 'geo_diamond', label: 'Diamonds', type: 'diamonds', colors: ['#1a1a2e','#e94560','#533483'], angle: 0 },
  ],
  organic: [
    { id: 'org_bubble', label: 'Bubbles', type: 'bubbles', colors: ['#0a0a23','#00bfff','#1e90ff'], angle: 0 },
    { id: 'org_blob', label: 'Blobs', type: 'blobs', colors: ['#1a1a2e','#ff6b6b','#ffa502'], angle: 0 },
    { id: 'org_swirl', label: 'Swirl', type: 'swirl', colors: ['#1a1a2e','#7f5af0'], angle: 0 },
    { id: 'org_cloud', label: 'Clouds', type: 'clouds', colors: ['#2c3e50','#bdc3c7','#ecf0f1'], angle: 0 },
    { id: 'org_splatter', label: 'Splatter', type: 'splatter', colors: ['#1a1a2e','#ff006e','#fb5607','#ffbe0b'], angle: 0 },
    { id: 'org_smoke', label: 'Smoke', type: 'smoke', colors: ['#0a0a23','#333366','#666699'], angle: 0 },
  ],
  neon: [
    { id: 'neon_blue', label: 'Neon Blue', colors: ['#000428','#004e92'], glow: '#00f2fe', angle: 0 },
    { id: 'neon_pink', label: 'Neon Pink', colors: ['#0a0a23','#1a0a23'], glow: '#ff00ff', angle: 0 },
    { id: 'neon_green', label: 'Neon Green', colors: ['#0a0a0a','#0a1a0a'], glow: '#39ff14', angle: 0 },
    { id: 'neon_red', label: 'Neon Red', colors: ['#0a0a0a','#1a0a0a'], glow: '#ff073a', angle: 0 },
    { id: 'neon_yellow', label: 'Neon Yellow', colors: ['#0a0a0a','#0a0a00'], glow: '#ffff00', angle: 0 },
    { id: 'neon_cyan', label: 'Neon Cyan', colors: ['#0a0a23','#0a1a23'], glow: '#00ffff', angle: 0 },
    { id: 'neon_orange', label: 'Neon Orange', colors: ['#0a0a0a','#1a0a00'], glow: '#ff6600', angle: 0 },
    { id: 'neon_purple', label: 'Neon Purple', colors: ['#0a0023','#1a0033'], glow: '#bf00ff', angle: 0 },
  ],
  glass: [
    { id: 'glass_white', label: 'White Glass', colors: ['rgba(255,255,255,0.15)','rgba(255,255,255,0.05)'], blur: true, angle: 0 },
    { id: 'glass_dark', label: 'Dark Glass', colors: ['rgba(0,0,0,0.4)','rgba(0,0,0,0.2)'], blur: true, angle: 0 },
    { id: 'glass_blue', label: 'Blue Glass', colors: ['rgba(59,130,246,0.2)','rgba(59,130,246,0.05)'], blur: true, angle: 0 },
    { id: 'glass_purple', label: 'Purple Glass', colors: ['rgba(139,92,246,0.2)','rgba(139,92,246,0.05)'], blur: true, angle: 0 },
    { id: 'glass_green', label: 'Green Glass', colors: ['rgba(16,185,129,0.2)','rgba(16,185,129,0.05)'], blur: true, angle: 0 },
    { id: 'glass_rose', label: 'Rose Glass', colors: ['rgba(244,63,94,0.2)','rgba(244,63,94,0.05)'], blur: true, angle: 0 },
  ],
  metallic: [
    { id: 'metal_gold', label: 'Gold', colors: ['#BF953F','#FCF6BA','#B38728','#FBF5B7','#AA771C'], angle: 135 },
    { id: 'metal_silver', label: 'Silver', colors: ['#C0C0C0','#E8E8E8','#A9A9A9','#D3D3D3','#808080'], angle: 135 },
    { id: 'metal_bronze', label: 'Bronze', colors: ['#CD7F32','#D4A76A','#B87333','#E6BE8A'], angle: 135 },
    { id: 'metal_chrome', label: 'Chrome', colors: ['#CCCCCC','#FFFFFF','#999999','#EEEEEE'], angle: 45 },
    { id: 'metal_copper', label: 'Copper', colors: ['#B87333','#DA8A67','#CB6D51','#E8A87C'], angle: 135 },
    { id: 'metal_platinum', label: 'Platinum', colors: ['#E5E4E2','#A0A0A0','#D4D4D4','#B8B8B8'], angle: 135 },
  ],
  nature: [
    { id: 'nat_forest', label: 'Forest', colors: ['#134e4a','#166534','#14532d'], angle: 180 },
    { id: 'nat_ocean', label: 'Ocean Deep', colors: ['#0c4a6e','#164e63','#155e75'], angle: 180 },
    { id: 'nat_sunset', label: 'Desert Sunset', colors: ['#9a3412','#c2410c','#ea580c','#fb923c'], angle: 180 },
    { id: 'nat_cherry', label: 'Cherry Blossom', colors: ['#fecdd3','#fda4af','#fb7185','#f43f5e'], angle: 135 },
    { id: 'nat_autumn', label: 'Autumn', colors: ['#92400e','#b45309','#d97706','#f59e0b'], angle: 135 },
    { id: 'nat_lavender', label: 'Lavender', colors: ['#7c3aed','#8b5cf6','#a78bfa','#c4b5fd'], angle: 135 },
    { id: 'nat_earth', label: 'Earth', colors: ['#422006','#78350f','#92400e','#a16207'], angle: 180 },
  ],
  retro: [
    { id: 'ret_vaporwave', label: 'Vaporwave', colors: ['#ff71ce','#01cdfe','#05ffa1','#b967ff','#fffb96'], angle: 135 },
    { id: 'ret_80s', label: '80s Neon', colors: ['#ff00ff','#00ffff','#ff0066','#6600ff'], angle: 45 },
    { id: 'ret_synthwave', label: 'Synthwave', colors: ['#2b1055','#d53369','#daae51'], angle: 180 },
    { id: 'ret_miami', label: 'Miami', colors: ['#f953c6','#b91d73','#00d2ff'], angle: 135 },
    { id: 'ret_sunset_drive', label: 'Sunset Drive', colors: ['#fc466b','#3f5efb'], angle: 135 },
    { id: 'ret_tron', label: 'Tron', colors: ['#000000','#003366','#00ccff'], angle: 180 },
  ],
  dark: [
    { id: 'dark_void', label: 'Void', colors: ['#000000','#0a0a0a','#111111'], angle: 180 },
    { id: 'dark_charcoal', label: 'Charcoal', colors: ['#1a1a1a','#2d2d2d','#404040'], angle: 180 },
    { id: 'dark_navy', label: 'Navy', colors: ['#0d1117','#161b22','#21262d'], angle: 180 },
    { id: 'dark_wine', label: 'Wine', colors: ['#1a0000','#330000','#4d0000'], angle: 180 },
    { id: 'dark_forest', label: 'Dark Forest', colors: ['#001a00','#003300','#004d00'], angle: 180 },
    { id: 'dark_royal', label: 'Royal Purple', colors: ['#0a001a','#1a0033','#2a004d'], angle: 180 },
    { id: 'dark_obsidian', label: 'Obsidian', colors: ['#0a0a0f','#141428','#1e1e3f'], angle: 135 },
  ],
};

export const DOODLE_CATEGORIES = [
  { id: 'cartoon_face', label: 'Cartoon Faces' },
  { id: 'hand_drawn', label: 'Hand Drawn' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'nature_doodle', label: 'Nature' },
  { id: 'love_doodle', label: 'Love & Hearts' },
  { id: 'star_sparkle', label: 'Stars & Sparkle' },
  { id: 'arrow_pointer', label: 'Arrows & Pointers' },
  { id: 'speech_bubble', label: 'Speech Bubbles' },
  { id: 'food_doodle', label: 'Food' },
  { id: 'music_doodle', label: 'Music' },
  { id: 'tech_doodle', label: 'Tech' },
  { id: 'sport_doodle', label: 'Sports' },
  { id: 'weather_doodle', label: 'Weather' },
  { id: 'celebration_doodle', label: 'Celebration' },
  { id: 'animal_doodle', label: 'Animals' },
  { id: 'abstract_doodle', label: 'Abstract' },
];

export const DOODLE_LIBRARY = {
  cartoon_face: ['😊','😄','😎','🤩','😍','🥳','🤪','😜','🤓','🧐','🥸','😇','🤠','🤡','👻','👽','🤖','💩','🫠','🥹','😈','👿','🤑','😏','🫡','🫢','🤭','🤫','😶‍🌫️','🫥'],
  hand_drawn: ['✏️','✍️','🖊️','🖋️','🖌️','🖍️','📝','📐','📏','🔍','🔎','💡','⚡','🔥','💫','✨','⭐','🌟','💎','🔮','🎯','🏹','🪄','🎨','🎭','🎪','🎠','🎡','🎢','🗝️'],
  decorative: ['✿','❀','❁','❃','❋','✾','✽','✼','❊','❉','❈','⚜️','🔱','💠','🔶','🔷','🔸','🔹','🔺','🔻','♦️','♠️','♣️','♥️','🃏','🪬','🧿','🏵️','🎀','🎗️'],
  nature_doodle: ['🌿','🌱','🌲','🌳','🌴','🍀','☘️','🌺','🌻','🌹','🌷','🌸','💐','🪷','🌼','🍃','🍂','🍁','🦋','🐝','🐞','🐌','🌈','☀️','🌙','⭐','🌊','💧','☁️','🌵'],
  love_doodle: ['❤️','🧡','💛','💚','💙','💜','🩷','🩵','🤍','🖤','❤️‍🔥','💔','❣️','💕','💗','💖','💘','💝','💞','💓','💟','🫶','💑','💏','💐','🌹','🥀','💍','💌','🏹'],
  star_sparkle: ['⭐','🌟','✨','💫','🔆','🔅','✡️','🔯','✳️','❇️','🌠','☄️','💎','🔮','🪩','🎇','🎆','💥','🌀','🎯','🏆','🥇','🏅','🎖️','👑','💍','📿','🪬','🧿','💠'],
  arrow_pointer: ['➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↩️','↪️','⤴️','⤵️','🔄','🔃','🔁','🔂','⏩','⏪','▶️','◀️','🔼','🔽','👉','👈','👆','👇','☝️','🫵','👊','✊'],
  speech_bubble: ['💬','💭','🗯️','🗨️','💌','📩','📨','✉️','📧','📝','📋','📄','📃','📜','🏷️','🔖','📎','🖇️','📌','📍','🗒️','🗓️','📅','📆','📇','🔔','🔕','📢','📣','📯'],
  food_doodle: ['🍕','🍔','🍟','🌮','🍩','🍪','🧁','🍰','🎂','🍦','🍫','🍬','🍭','🍿','☕','🧋','🥤','🍺','🍷','🧃','🍎','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🥑','🌽'],
  music_doodle: ['🎵','🎶','🎼','🎸','🎹','🎺','🎷','🥁','🎻','🎤','🎧','🎙️','📯','📻','🎚️','🎛️','🎬','🎭','💃','🕺','🪩','🎪','🎠','🪈','🪇','🪘','🪗','🪕','🎰','🎲'],
  tech_doodle: ['💻','🖥️','📱','⌨️','🖱️','🔋','🔌','💡','📡','🔬','🔭','⚙️','🔧','🛠️','💾','📸','🎮','🕹️','🤖','🦾','🧬','⚡','🔗','🌐','📶','🛰️','💎','🔮','📺','📻'],
  sport_doodle: ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🏒','🏏','🥊','🥋','🏹','🎣','🎯','🏆','🥇','🥈','🥉','🏅','🎖️','🏃','🚴','🏊','🧗','🤸','🏋️','⛹️','🤾'],
  weather_doodle: ['☀️','🌤️','⛅','☁️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌈','🌊','💧','💦','☔','⚡','🌡️','🔥','☄️','🌙','⭐','✨','💫','🌟','🌠','🫧'],
  celebration_doodle: ['🎉','🎊','🎈','🎀','🎁','🎂','🧁','🎆','🎇','🧨','✨','🎃','🎄','🎋','🎗️','🎟️','🎫','🏆','🏅','🥳','🪅','🪆','🪩','🎭','🤹','🎪','🎠','💐','🍾','🥂'],
  animal_doodle: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦋','🐝','🐞','🐢','🐍','🦎','🐙','🐬','🐳','🦈','🦄','🐉'],
  abstract_doodle: ['🌀','💠','🔶','🔷','🔸','🔹','🔺','🔻','⭕','❗','❓','‼️','⁉️','💯','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','♾️','⚛️','☯️','☮️','♻️','⚜️','🔱'],
};

export const TEXT_BG_LOGIC_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'perFrame', label: 'Per Frame (same for all text)' },
  { id: 'perLine', label: 'Per Line (each line different)' },
  { id: 'perWord', label: 'Per Word (each word different)' },
  { id: 'perOverlay', label: 'Per Overlay Column' },
  { id: 'intentBased', label: 'Intent Based (auto from text)' },
  { id: 'random', label: 'Random' },
  { id: 'cycle', label: 'Cycle Through' },
];

export const DOODLE_LOGIC_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'scatter', label: 'Scatter (random positions)' },
  { id: 'border', label: 'Border (around text)' },
  { id: 'perWord', label: 'Per Word' },
  { id: 'perLine', label: 'Per Line (start/end)' },
  { id: 'corners', label: 'Corners' },
  { id: 'intentBased', label: 'Intent Based (auto from text)' },
  { id: 'random', label: 'Random' },
  { id: 'rain', label: 'Rain (falling down)' },
  { id: 'float', label: 'Float (rising up)' },
];

export const DOODLE_ANIMATION_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'fadeIn', label: 'Fade In' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'spin', label: 'Spin' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'float', label: 'Float' },
  { id: 'pop', label: 'Pop In' },
  { id: 'rain', label: 'Rain Down' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'wave', label: 'Wave' },
  { id: 'shake', label: 'Shake' },
];

const INTENT_TO_BG = {
  love: 'gradient:sunset', happy: 'gradient:candy', sad: 'dark:dark_navy',
  angry: 'gradient:fire', fear: 'dark:dark_void', motivational: 'gradient:gold_shine',
  nature: 'nature:nat_forest', tech: 'neon:neon_blue', food: 'gradient:peach',
  money: 'metallic:metal_gold', education: 'gradient:sky', health: 'gradient:forest',
  music: 'retro:ret_vaporwave', travel: 'gradient:ocean', sport: 'gradient:fire',
  celebration: 'gradient:rainbow', religion: 'gradient:gold_shine',
  warning: 'neon:neon_red', question: 'neon:neon_cyan', time: 'dark:dark_charcoal',
  success: 'gradient:gold_shine', family: 'gradient:peach',
};

const INTENT_TO_DOODLE = {
  love: 'love_doodle', happy: 'celebration_doodle', sad: 'weather_doodle',
  angry: 'abstract_doodle', fear: 'abstract_doodle', motivational: 'star_sparkle',
  nature: 'nature_doodle', tech: 'tech_doodle', food: 'food_doodle',
  money: 'star_sparkle', education: 'hand_drawn', health: 'nature_doodle',
  music: 'music_doodle', travel: 'arrow_pointer', sport: 'sport_doodle',
  celebration: 'celebration_doodle', religion: 'star_sparkle',
  warning: 'arrow_pointer', question: 'speech_bubble', time: 'hand_drawn',
  success: 'celebration_doodle', family: 'love_doodle',
};

export function getTextBgForIntent(intent) {
  return INTENT_TO_BG[intent] || 'gradient:ocean';
}

export function getDoodleCategoryForIntent(intent) {
  return INTENT_TO_DOODLE[intent] || 'star_sparkle';
}

export function drawTextBgPattern(ctx, x, y, w, h, pattern, borderRadius = 8) {
  if (!pattern || !pattern.colors || pattern.colors.length === 0) return;
  const isFullCanvas = (borderRadius === 0 && x === 0 && y === 0);
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);
  ctx.save();
  if (borderRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, borderRadius);
    ctx.clip();
  }

  if (pattern.colors.length === 1) {
    ctx.fillStyle = pattern.colors[0];
    ctx.fillRect(x, y, w, h);
  } else {
    const angle = (pattern.angle || 135) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const len = Math.sqrt(w * w + h * h) / 2;
    const grad = ctx.createLinearGradient(cx - cos * len, cy - sin * len, cx + cos * len, cy + sin * len);
    pattern.colors.forEach((c, i) => grad.addColorStop(i / Math.max(1, pattern.colors.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  if (pattern.glow) {
    const glowBlur = isFullCanvas ? Math.max(30, minDim * 0.04) : 15;
    const glowWidth = isFullCanvas ? 3 : 2;
    ctx.shadowColor = pattern.glow;
    ctx.shadowBlur = glowBlur;
    ctx.strokeStyle = pattern.glow;
    ctx.lineWidth = glowWidth;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, borderRadius);
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (isFullCanvas) {
      ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.15;
      const rGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, maxDim * 0.6);
      rGrad.addColorStop(0, pattern.glow);
      rGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rGrad;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = (ctx.globalAlpha || 1) / 0.15;
    }
  }

  const dotR = isFullCanvas ? Math.max(3, minDim / 200) : 1.5;
  const gridLW = isFullCanvas ? Math.max(1, minDim / 600) : 0.5;
  const diagLW = isFullCanvas ? Math.max(1.5, minDim / 400) : 1;
  const waveAmp = isFullCanvas ? Math.max(8, minDim / 60) : 4;
  const waveLW = isFullCanvas ? Math.max(1.5, minDim / 500) : 1;

  if (pattern.type === 'dots') {
    ctx.fillStyle = pattern.colors[1] || 'rgba(255,255,255,0.15)';
    const spacing = isFullCanvas ? Math.max(20, minDim / 25) : Math.max(8, w / 15);
    for (let px = x + spacing / 2; px < x + w; px += spacing) {
      for (let py = y + spacing / 2; py < y + h; py += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern.type === 'grid') {
    ctx.strokeStyle = pattern.colors[1] || 'rgba(255,255,255,0.1)';
    ctx.lineWidth = gridLW;
    const spacing = isFullCanvas ? Math.max(25, minDim / 20) : Math.max(8, w / 12);
    for (let px = x; px <= x + w; px += spacing) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke(); }
    for (let py = y; py <= y + h; py += spacing) { ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke(); }
  } else if (pattern.type === 'diagonal') {
    ctx.strokeStyle = (pattern.colors[2] || pattern.colors[1] || 'rgba(255,255,255,0.08)');
    ctx.lineWidth = diagLW;
    const spacing = isFullCanvas ? Math.max(15, minDim / 20) : Math.max(6, w / 10);
    for (let i = -h; i < w + h; i += spacing) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + h, y + h); ctx.stroke(); }
  } else if (pattern.type === 'checker') {
    const sz = isFullCanvas ? Math.max(15, minDim / 20) : Math.max(6, w / 12);
    for (let row = 0; row < h / sz + 1; row++) {
      for (let col = 0; col < w / sz + 1; col++) {
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = pattern.colors[1] || 'rgba(255,255,255,0.05)';
          ctx.fillRect(x + col * sz, y + row * sz, sz, sz);
        }
      }
    }
  } else if (pattern.type === 'waves') {
    ctx.strokeStyle = pattern.colors[1] || 'rgba(255,255,255,0.15)';
    ctx.lineWidth = waveLW;
    const spacing = isFullCanvas ? Math.max(15, minDim / 20) : Math.max(6, h / 6);
    const step = isFullCanvas ? Math.max(4, minDim / 200) : 4;
    const freq = isFullCanvas ? Math.max(20, minDim / 30) : 15;
    for (let py = y; py < y + h; py += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, py);
      for (let px = x; px <= x + w; px += step) ctx.lineTo(px, py + Math.sin((px - x) / freq) * waveAmp);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawDoodlesOnArea(ctx, x, y, w, h, doodles, logic, t, animType, doodleSize, doodleOpacity) {
  if (!doodles || doodles.length === 0) return;
  const sz = doodleSize || 16;
  const alpha = doodleOpacity ?? 0.8;
  const isFullCanvas = (x === 0 && y === 0 && w > 200 && h > 200);
  const minDim = Math.min(w, h);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${sz}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const positions = [];
  const seed = (w * 31 + h * 17) | 0;

  if (logic === 'scatter' || logic === 'random') {
    const density = isFullCanvas ? 12 : 8;
    const count = Math.max(5, Math.floor((w * h) / (sz * sz * density)));
    const capped = Math.min(count, isFullCanvas ? 150 : 60);
    for (let i = 0; i < capped; i++) {
      const hash = ((seed + i * 7919) * 2654435761) >>> 0;
      positions.push({ px: x + (hash % Math.floor(w)), py: y + ((hash >> 10) % Math.floor(h)), d: doodles[i % doodles.length] });
    }
  } else if (logic === 'border') {
    const step = isFullCanvas ? Math.max(sz * 2, minDim / 15) : Math.max(sz * 1.5, 20);
    const pad = isFullCanvas ? sz * 1.2 : sz / 2;
    for (let px = x; px < x + w; px += step) positions.push({ px: px + pad, py: y + pad, d: doodles[positions.length % doodles.length] });
    for (let px = x; px < x + w; px += step) positions.push({ px: px + pad, py: y + h - pad, d: doodles[positions.length % doodles.length] });
    for (let py = y + step; py < y + h - step; py += step) positions.push({ px: x + pad, py, d: doodles[positions.length % doodles.length] });
    for (let py = y + step; py < y + h - step; py += step) positions.push({ px: x + w - pad, py, d: doodles[positions.length % doodles.length] });
  } else if (logic === 'corners') {
    const pad = isFullCanvas ? sz * 2 : sz;
    const cCount = isFullCanvas ? 3 : 1;
    for (let ci = 0; ci < cCount; ci++) {
      const off = ci * sz * 1.8;
      positions.push({ px: x + pad + off, py: y + pad + off, d: doodles[(ci * 4) % doodles.length] });
      positions.push({ px: x + w - pad - off, py: y + pad + off, d: doodles[(ci * 4 + 1) % doodles.length] });
      positions.push({ px: x + pad + off, py: y + h - pad - off, d: doodles[(ci * 4 + 2) % doodles.length] });
      positions.push({ px: x + w - pad - off, py: y + h - pad - off, d: doodles[(ci * 4 + 3) % doodles.length] });
    }
  } else if (logic === 'rain' || logic === 'float') {
    const colCount = isFullCanvas ? Math.max(8, Math.floor(w / (sz * 2.5))) : Math.max(3, Math.floor(w / (sz * 2)));
    const capped = Math.min(colCount, isFullCanvas ? 60 : 30);
    for (let i = 0; i < capped; i++) {
      const hash = ((seed + i * 7919) * 2654435761) >>> 0;
      const xp = x + (hash % Math.floor(w));
      const phase = (t || 0) * 0.5 + i * 0.3;
      const yp = logic === 'rain' ? y + ((phase * sz * 3) % h) : y + h - ((phase * sz * 3) % h);
      positions.push({ px: xp, py: yp, d: doodles[i % doodles.length] });
    }
  } else if (logic === 'perWord' || logic === 'perLine') {
    const step = logic === 'perWord' ? Math.max(sz * 2, 30) : Math.max(sz * 3, 50);
    if (isFullCanvas) {
      const rows = Math.max(1, Math.floor(h / (step * 1.5)));
      for (let r = 0; r < rows; r++) {
        const rowY = y + (r + 0.5) * (h / rows);
        for (let px = x + step / 2; px < x + w; px += step) {
          positions.push({ px, py: rowY, d: doodles[positions.length % doodles.length] });
        }
      }
    } else {
      for (let px = x + step / 2; px < x + w; px += step) {
        positions.push({ px, py: y - sz * 0.3, d: doodles[positions.length % doodles.length] });
      }
    }
  } else {
    const count = isFullCanvas ? Math.max(5, Math.floor(w / (sz * 2))) : Math.max(2, Math.floor(w / (sz * 3)));
    for (let i = 0; i < count; i++) {
      positions.push({ px: x + (i + 0.5) * (w / count), py: isFullCanvas ? y + h / 2 : y - sz * 0.5, d: doodles[i % doodles.length] });
    }
  }

  const animScale = isFullCanvas ? Math.max(1, minDim / 200) : 1;
  positions.forEach((p, i) => {
    ctx.save();
    ctx.translate(p.px, p.py);
    if (animType === 'spin') ctx.rotate(((t || 0) + i * 0.5) % (Math.PI * 2));
    else if (animType === 'wiggle') ctx.rotate(Math.sin((t || 0) * 3 + i) * 0.25);
    else if (animType === 'bounce') ctx.translate(0, Math.sin((t || 0) * 4 + i) * 5 * animScale);
    else if (animType === 'pulse') { const s = 1 + Math.sin((t || 0) * 3 + i) * 0.2; ctx.scale(s, s); }
    else if (animType === 'float') ctx.translate(Math.sin((t || 0) * 2 + i) * 5 * animScale, Math.cos((t || 0) * 1.5 + i) * 5 * animScale);
    else if (animType === 'shake') ctx.translate(Math.sin((t || 0) * 8 + i) * 3 * animScale, 0);
    else if (animType === 'wave') ctx.translate(0, Math.sin((t || 0) * 3 + i * 0.8) * 6 * animScale);
    else if (animType === 'pop') { const p2 = Math.min(1, (t || 0.5)); ctx.scale(p2, p2); }
    else if (animType === 'sparkle') ctx.globalAlpha = alpha * (0.5 + Math.sin((t || 0) * 5 + i * 1.2) * 0.5);
    try { ctx.fillText(String(p.d || '✦').slice(0, 3), 0, 0); } catch (_) {}
    ctx.restore();
  });

  ctx.restore();
}
