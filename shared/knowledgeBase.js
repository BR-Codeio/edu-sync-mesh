// Edu-Sync Mesh — Offline AI Tutor Engine
//
// Simulates what would run locally on the Village Hub's quantized LLM
// (see docs/TECHNICAL_DOCUMENTATION.md). Since this prototype has no
// backend or network access, answers come from a curated ZIMSEC-aligned
// knowledge base matched by keyword scoring rather than a live model call —
// but the matching is broad enough to hold up to a real demo Q&A session.

const KNOWLEDGE_BASE = [
  // ---------------- MATHEMATICS ----------------
  {
    subject: 'Mathematics',
    keywords: ['quadratic', 'equation', 'quadratic equation', 'x2', 'x^2'],
    answer:
      "A quadratic equation has the form ax² + bx + c = 0. You solve it with the quadratic formula: x = (−b ± √(b² − 4ac)) / 2a. First identify a, b, and c from your equation, then substitute them in. For example, for x² − 5x + 6 = 0: a=1, b=−5, c=6, which factors to (x−2)(x−3)=0, so x = 2 or x = 3. Mashoko eShona: Formula iyi inoshanda pane ese ma-equation ane x².",
  },
  {
    subject: 'Mathematics',
    keywords: ['pythagoras', 'pythagorean', 'right angle triangle', 'hypotenuse'],
    answer:
      "Pythagoras' Theorem applies to right-angled triangles: a² + b² = c², where c is the hypotenuse (the longest side, opposite the right angle). If two sides are 3cm and 4cm, the hypotenuse is √(3²+4²) = √25 = 5cm. Remember: the theorem only works for right-angled triangles.",
  },
  {
    subject: 'Mathematics',
    keywords: ['fraction', 'fractions', 'simplify', 'lcd', 'lowest common denominator'],
    answer:
      "To add or subtract fractions, first find the Lowest Common Denominator (LCD) — the smallest number both denominators divide into evenly. Convert both fractions to that denominator, then add/subtract the numerators. To simplify a fraction, divide the top and bottom by their Highest Common Factor (HCF). Example: 6/8 → HCF is 2 → 3/4.",
  },
  {
    subject: 'Mathematics',
    keywords: ['percentage', 'percent', '%'],
    answer:
      "To find a percentage of a number: (percentage ÷ 100) × number. Example: 15% of 200 = (15/100) × 200 = 30. To find what percentage one number is of another: (part ÷ whole) × 100. Percentage increase/decrease = (change ÷ original) × 100.",
  },
  {
    subject: 'Mathematics',
    keywords: ['algebra', 'simultaneous equation', 'solve for x', 'linear equation'],
    answer:
      "For simultaneous equations with two unknowns, use substitution or elimination. Elimination: make the coefficient of one variable equal in both equations, then add or subtract to cancel it out. Example: 2x+y=10 and x−y=2 → adding gives 3x=12, so x=4, and y=2. Always check your answer by substituting back into both original equations.",
  },
  {
    subject: 'Mathematics',
    keywords: ['area', 'perimeter', 'circle', 'circumference', 'volume'],
    answer:
      "Key formulas: Rectangle area = length × width. Circle area = πr². Circle circumference = 2πr. Triangle area = ½ × base × height. Cuboid volume = length × width × height. Always check your units match (e.g. all in cm) before calculating.",
  },

  // ---------------- BIOLOGY ----------------
  {
    subject: 'Biology',
    keywords: ['cell', 'cell structure', 'nucleus', 'cytoplasm', 'membrane', 'organelle'],
    answer:
      "A typical cell has three main parts: the nucleus (contains DNA and controls the cell), the cytoplasm (jelly-like substance where chemical reactions happen), and the cell membrane (controls what enters and exits). Plant cells additionally have a cell wall, chloroplasts (for photosynthesis), and a large vacuole, which animal cells lack.",
  },
  {
    subject: 'Biology',
    keywords: ['photosynthesis', 'chlorophyll', 'sunlight energy'],
    answer:
      "Photosynthesis is how plants make food using sunlight. Word equation: carbon dioxide + water → (sunlight + chlorophyll) → glucose + oxygen. It happens mainly in the leaves, inside chloroplasts. Plants need sunlight, water, carbon dioxide, and chlorophyll for this process to occur.",
  },
  {
    subject: 'Biology',
    keywords: ['respiration', 'breathing', 'aerobic', 'anaerobic'],
    answer:
      "Respiration releases energy from food. Aerobic respiration (with oxygen): glucose + oxygen → carbon dioxide + water + energy. Anaerobic respiration (without oxygen) in humans produces lactic acid and less energy — this is why muscles feel tired during intense exercise. Don't confuse respiration (a chemical process in cells) with breathing (moving air in/out of lungs).",
  },
  {
    subject: 'Biology',
    keywords: ['reproduction', 'gamete', 'fertilisation', 'fertilization', 'puberty'],
    answer:
      "In sexual reproduction, a male gamete (sperm) fuses with a female gamete (egg/ovum) in fertilisation to form a zygote, which develops into a new organism. This combines genetic material from both parents, creating variation in offspring — important for a species' survival and adaptation.",
  },
  {
    subject: 'Biology',
    keywords: ['ecosystem', 'food chain', 'food web', 'producer', 'consumer'],
    answer:
      "A food chain shows energy flow: Producers (plants, make their own food) → Primary consumers (herbivores) → Secondary consumers (carnivores that eat herbivores) → Tertiary consumers (top predators). Energy decreases at each level — only about 10% transfers to the next level, which is why food chains rarely have more than 4-5 links.",
  },

  // ---------------- CHEMISTRY ----------------
  {
    subject: 'Chemistry',
    keywords: ['periodic table', 'element', 'atomic number', 'group', 'period'],
    answer:
      "The periodic table arranges elements by atomic number (number of protons). Columns (groups) share similar chemical properties because they have the same number of outer-shell electrons. Rows (periods) show elements with the same number of electron shells. Group 1 = alkali metals, Group 7 = halogens, Group 0/8 = noble gases.",
  },
  {
    subject: 'Chemistry',
    keywords: ['acid', 'base', 'alkali', 'ph scale', 'neutralisation', 'neutralization'],
    answer:
      "Acids have a pH below 7 (release H+ ions in water); bases/alkalis have a pH above 7 (release OH− ions); pH 7 is neutral (pure water). Neutralisation: acid + base → salt + water. Universal indicator changes colour to show pH: red/orange = strongly acidic, green = neutral, purple/blue = strongly alkaline.",
  },
  {
    subject: 'Chemistry',
    keywords: ['chemical bond', 'ionic bond', 'covalent bond', 'bonding'],
    answer:
      "Ionic bonding occurs between a metal and a non-metal — electrons transfer, creating charged ions that attract each other (e.g. NaCl, table salt). Covalent bonding occurs between two non-metals — atoms share electrons (e.g. H2O, CO2). Ionic compounds tend to have high melting points; covalent compounds often have lower melting points and don't conduct electricity when solid.",
  },
  {
    subject: 'Chemistry',
    keywords: ['states of matter', 'solid liquid gas', 'melting point', 'boiling point', 'evaporation'],
    answer:
      "The three states of matter are solid (fixed shape and volume, particles vibrate in place), liquid (fixed volume but takes the shape of its container, particles move around each other), and gas (no fixed shape or volume, particles move freely and fast). Melting = solid→liquid, boiling/evaporation = liquid→gas, condensation = gas→liquid, freezing = liquid→solid.",
  },

  // ---------------- PHYSICS ----------------
  {
    subject: 'Physics',
    keywords: ['force', 'newton', 'motion', 'velocity', 'acceleration', 'speed'],
    answer:
      "Newton's First Law: an object stays at rest or moves at constant velocity unless a resultant force acts on it. Newton's Second Law: F = ma (Force = mass × acceleration). Newton's Third Law: for every action there is an equal and opposite reaction. Speed = distance ÷ time; acceleration = change in velocity ÷ time taken.",
  },
  {
    subject: 'Physics',
    keywords: ['energy', 'kinetic', 'potential energy', 'conservation of energy'],
    answer:
      "The Law of Conservation of Energy states energy cannot be created or destroyed, only transformed from one form to another. Kinetic energy (movement) = ½mv². Gravitational potential energy (stored due to height) = mgh. Example: a ball dropped from a height converts potential energy into kinetic energy as it falls.",
  },
  {
    subject: 'Physics',
    keywords: ['electricity', 'circuit', 'current', 'voltage', 'resistance', 'ohms law'],
    answer:
      "Ohm's Law: V = IR (Voltage = Current × Resistance). Current (measured in amps) is the flow of electric charge; voltage (volts) is the energy pushing that charge; resistance (ohms) opposes the flow. In a series circuit, current is the same throughout and voltage is shared; in a parallel circuit, voltage is the same across each branch and current is shared.",
  },
  {
    subject: 'Physics',
    keywords: ['light', 'reflection', 'refraction', 'lens'],
    answer:
      "Reflection: light bounces off a surface — the angle of incidence equals the angle of reflection. Refraction: light bends when passing between materials of different density (e.g. air to water), because its speed changes. Convex lenses converge light rays (used in magnifying glasses); concave lenses diverge them (used to correct short-sightedness).",
  },

  // ---------------- ENGLISH ----------------
  {
    subject: 'English',
    keywords: ['essay', 'composition', 'writing', 'introduction paragraph'],
    answer:
      "A strong ZIMSEC composition needs: an engaging introduction that sets the scene, 3-4 body paragraphs each developing one clear idea with descriptive detail, and a conclusion that ties the piece together. For narrative essays, use varied sentence structure and strong verbs instead of repeating 'said' or 'went'. Always plan your points before you start writing.",
  },
  {
    subject: 'English',
    keywords: ['parts of speech', 'noun', 'verb', 'adjective', 'adverb', 'grammar'],
    answer:
      "The main parts of speech: Noun (person/place/thing — e.g. 'teacher'), Verb (action/state — e.g. 'runs'), Adjective (describes a noun — e.g. 'tall'), Adverb (describes a verb — e.g. 'quickly'), Pronoun (replaces a noun — e.g. 'she'), Preposition (shows relationship — e.g. 'under'), Conjunction (joins words/clauses — e.g. 'and', 'because').",
  },
  {
    subject: 'English',
    keywords: ['comprehension', 'summary', 'reading passage'],
    answer:
      "For comprehension passages: read the whole passage once for general understanding before answering questions. For summary questions, identify only the main points (not examples or details), and rewrite them in your own words rather than copying sentences directly — ZIMSEC examiners deduct marks for direct lifting.",
  },

  // ---------------- SHONA ----------------
  {
    subject: 'Shona',
    keywords: ['mabviro', 'mabviro nemauto', 'samkange'],
    answer:
      "Mabviro Nemauto rakanyorwa naStanlake Samkange. Bhuku iri rinotaura nezvenhoroondo yeZimbabwe, kunanga pahondo yekutanga yeChimurenga. Rine zvidzidzo pamusoro pekuzvipira, hushingi, uye kuzvidavirira kwevanhu veZimbabwe pakurwira nyika yavo.",
  },
  {
    subject: 'Shona',
    keywords: ['tsumo', 'madimikira', 'proverb', 'shona proverb'],
    answer:
      "Tsumo dzinoshandiswa kudzidzisa tsika nemagariro. Semuenzaniso: 'Chara chimwe hachitswanyi inda' zvinoreva kuti kubatana kunopa simba — umwe munhu haakwanisi kuita basa rakawanda ari oga. Tsumo dzinobatsira kufananidzira zvinotaurwa nezvinoitika muupenyu.",
  },
  {
    subject: 'Shona',
    keywords: ['grammar', 'shona grammar', 'mitsara', 'mazwi'],
    answer:
      "Mutsara muShona unofanira kuve nechinhu (subject) uye chiito (verb). Semuenzaniso: 'Mwana anodya sadza' — 'mwana' ndicho chinhu, 'anodya' ndicho chiito. Kunyora zvakanaka kunoda kuti uzive mativi ako emazwi — mazita (nouns), mazwi echiito (verbs), uye zvirevo (adjectives).",
  },
  {
    subject: 'Shona',
    keywords: ['detembo', 'nhetembo', 'kudetemba', 'shona poem', 'shona poetry'],
    answer:
      "Detembo idetembo rechiShona rinoshandisa mutauro une mutinhimira nemifananidzo kuti ritaure pfungwa kana manzwiro. Nhetembo dzinowanzoshandisa: kudzokorodza kwemazwi (repetition) kuti kusimbise pfungwa, mifananidzo (imagery) inobva pazvinhu zvatinoona pazuva nezuva semvura, mwedzi, kana miti, uye mutinhimira unobva pakuverenga zvakarongwa zvakanaka. Nhetembo dzinogona kunge dzichitaura nezverudo, hunhu hwevanhu, kana kurumbidza mhuri neDzinza (madetembo okurumbidza).\n\nMuenzaniso wedetembo rerudo — 'Runako Rwerudo' (The Beauty of Love):\nRudo rwakaita sedziva remvura,\nRwakadzika, runotonhodza pakatsva.\nNdimi zuva rinovhenekera mangwanani,\nRinoisa runyararo pamoyo yangu inochema.\nUri mhepo inopfengedza pamazuva anotonhora,\nRunako rwako rwakaita seruva rinozvara.\nNdinokuda mudiwa wangu, wehurema,\nNdimi rukuvhute rwandinonamata.\n\nOna kuti detembo iri rinoshandisa mifananidzo (dziva remvura, zuva, mhepo, ruva) kufananidza manzwiro erudo. Kuti unyore rako, tanga nepfungwa imwe chete, shandisa mifananidzo inobva pazvinhu zvaunoziva, uye verenga zvawanyora kaviri kuti unzwe kana mutinhimira wacho wakanaka.",
  },

  // ---------------- GEOGRAPHY ----------------
  {
    subject: 'Geography',
    keywords: ['map', 'map reading', 'scale', 'contour', 'grid reference'],
    answer:
      "Map scale shows the relationship between distance on a map and real-world distance (e.g. 1:50000 means 1cm on the map = 50000cm / 500m in reality). Contour lines join points of equal height — closely spaced contours mean steep terrain, widely spaced contours mean gentle slopes. Grid references locate a point using eastings (horizontal) first, then northings (vertical).",
  },
  {
    subject: 'Geography',
    keywords: ['climate', 'weather', 'rainfall', 'drought'],
    answer:
      "Zimbabwe has three main seasons: the rainy/summer season (November–March, warm and wet), the cool dry season (April–August), and the hot dry season (September–October). Rainfall varies significantly by natural region — Natural Region I (Eastern Highlands) receives the most rainfall, while Region V (Lowveld) is the driest, prone to drought.",
  },

  // ---------------- HISTORY ----------------
  {
    subject: 'History',
    keywords: ['chimurenga', 'independence', 'liberation war', 'colonial'],
    answer:
      "Zimbabwe's liberation struggle had two major phases: the First Chimurenga (1896–97), an uprising against early colonial occupation, and the Second Chimurenga (1966–1979), the armed struggle that led to independence on 18 April 1980. Key factors included land dispossession under colonial rule, the Land Apportionment Act, and the formation of liberation movements ZANU and ZAPU.",
  },

  // ---------------- COMMERCE / BUSINESS STUDIES ----------------
  {
    subject: 'Commerce',
    keywords: ['accounting equation', 'assets', 'liabilities', 'balance sheet'],
    answer:
      "The accounting equation is: Assets = Liabilities + Owner's Equity. Assets are things the business owns (cash, equipment, stock). Liabilities are what it owes (loans, creditors). Owner's Equity is the owner's stake in the business. This equation must always balance — it's the foundation of double-entry bookkeeping.",
  },
  {
    subject: 'Commerce',
    keywords: ['supply and demand', 'market', 'price'],
    answer:
      "The Law of Demand: as price increases, quantity demanded decreases (and vice versa), assuming other factors stay constant. The Law of Supply: as price increases, quantity supplied increases, because producers want to earn more. Where the supply and demand curves meet is called the equilibrium price — the price at which quantity supplied equals quantity demanded.",
  },
];

const GREETINGS = ['hi', 'hello', 'mhoro', 'mhoroi', 'hesi', 'hey', 'good morning', 'good afternoon', 'makadii'];

const GREETING_RESPONSE =
  "Mhoro! Ndini AI Tutor yako, ndinogona kukubatsira ne Mathematics, Biology, Chemistry, Physics, English, Shona, Geography, History, uye Commerce. Ndibvunze chero chinhu chaunoda kudzidza — for example 'Explain photosynthesis' or 'Ndibatsire ne quadratic equations'.";

// Shona: "I don't have a confident answer from what's on the Village Hub right now.
// I've saved your question — once Data Mule Sync happens (teacher's phone or a USB
// flash drive carried on the daily commuter bus to town), I'll look it up online and
// bring back an answer. Check again after the next sync, or within 24 hours."
const FALLBACK_RESPONSE =
  "Handisati ndanzwisisa mubvunzo iwoyo zvakakwana nezvinhu zvandinoziva pa-Village Hub parizvino. Ndakuchengetedza mubvunzo wako — kana Data Mule Sync yaitika (foni yemudzidzisi kana USB flash drive inofambiswa nebhazi rinofamba mazuva ese kuenda kutown), ndichaenda kunotsvaga mhinduro pa-internet uye ndichakupa yacho. Tarisa zvakare mushure meDataMule Sync inotevera, kana mumaawa makumi maviri nemana (24 hours).";

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const NUMBER_WORDS = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  // Shona
  rimwe: 1, imwe: 1, mbiri: 2, tatu: 3, ina: 4, shanu: 5, tanhatu: 6, nomwe: 7, sere: 8, pfumbamwe: 9, gumi: 10,
};
const NUMBER_WORD_PATTERN = 'one|two|three|four|five|six|seven|eight|nine|ten|rimwe|imwe|mbiri|tatu|ina|shanu|tanhatu|nomwe|sere|pfumbamwe|gumi';

// Catches phrasing like "list 5 tsumo", "state 5 examples", "give me three reasons",
// "name 4 causes", or the Shona equivalents "ndipewo tsumo shanu", "nditsanangurire tsumo shanu".
const QUANTITY_VERB_PATTERN = new RegExp(
  `\\b(list|give|name|state|write|mention|provide|explain|ndipewo|ndipe|tsanangura|nditsanangurire|nditaurire|taura)\\b[^0-9a-z]{0,25}?\\b(\\d{1,2}|${NUMBER_WORD_PATTERN})\\b`,
  'i'
);

// Catches phrasing like "5 tsumo in shona", "3 causes of the war", "tsumo shanu" — a
// quantity next to a plural/listable noun, without needing a verb first, in either order.
const QUANTITY_NOUN_PATTERN = new RegExp(
  `\\b(\\d{1,2}|${NUMBER_WORD_PATTERN})\\b[^0-9a-z]{0,3}?\\b([a-z]+s|tsumo|mabviro)\\b|\\b(tsumo|mabviro)\\b[^0-9a-z]{0,3}?\\b(\\d{1,2}|${NUMBER_WORD_PATTERN})\\b`,
  'i'
);

/** Detects if the question is asking for a specific NUMBER of items (2+).
 * Our knowledge base entries are single worked-example/explanation blocks,
 * not curated lists — so "explain photosynthesis" is answerable, but
 * "list 5 tsumo" or "state 3 causes" usually isn't fully answerable from
 * one stored entry, and the tutor should say so honestly rather than
 * returning one example as if it satisfies "5". Recognizes both English
 * and Shona number words ("shanu" = five), since a Shona-speaking student
 * asking "ndipewo tsumo shanu" deserves the same honesty as one asking
 * in English. */
function detectRequestedQuantity(rawQuery) {
  const verbMatch = rawQuery.match(QUANTITY_VERB_PATTERN);
  const nounMatch = rawQuery.match(QUANTITY_NOUN_PATTERN);
  const source = verbMatch || nounMatch;
  if (!source) return null;

  // Whichever pattern matched, find the actual number token among its capture groups
  // (position varies: verb-first, noun-first-with-number-second, or number-first-with-noun-second).
  const raw = source.slice(1).find((g) => g && (NUMBER_WORDS[g.toLowerCase()] || /^\d+$/.test(g)));
  if (!raw) return null;
  const n = /^\d+$/.test(raw) ? parseInt(raw, 10) : NUMBER_WORDS[raw.toLowerCase()];
  return n && n >= 2 ? n : null;
}

/** Builds a real, working search link for a queued question — used once
 * connectivity returns via Data Mule Sync (teacher's phone or USB drive in town). */
export function getSearchUrl(question) {
  return `https://duckduckgo.com/?q=${encodeURIComponent(question + ' ZIMSEC syllabus')}`;
}

/**
 * Scores every knowledge base entry against the query and returns the best match.
 * A real Village Hub deployment would replace this with an actual quantized LLM
 * call (see docs/TECHNICAL_DOCUMENTATION.md §2B) — this keyword-scored matcher
 * exists so the prototype can demo realistic Q&A without a backend or network call.
 */
export function getTutorResponse(rawQuery) {
  const query = normalize(rawQuery);

  if (!query) {
    return { subject: null, text: FALLBACK_RESPONSE, unresolved: true };
  }

  if (GREETINGS.some((g) => query === g || query.startsWith(g + ' '))) {
    return { subject: null, text: GREETING_RESPONSE, unresolved: false };
  }

  const queryWords = query.split(' ');
  const requestedQuantity = detectRequestedQuantity(rawQuery);
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      if (query.includes(kw)) {
        // Multi-word keyword matches score higher than single-word matches
        score += kw.split(' ').length >= 2 ? 3 : 1;
      } else {
        // Partial credit for individual word overlap
        const kwWords = kw.split(' ');
        const overlap = kwWords.filter((w) => queryWords.includes(w)).length;
        score += overlap * 0.5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // The Village Hub's local knowledge base holds one worked example per topic,
  // not curated lists — so a request for a specific quantity (e.g. "list 5 tsumo")
  // can't be honestly satisfied from what's stored locally, even if the topic
  // itself matches. Say so plainly instead of returning one example as if it
  // were the full answer, and queue the question for a fuller lookup on sync.
  if (requestedQuantity) {
    if (bestMatch && bestScore >= 1) {
      return {
        subject: bestMatch.subject,
        text: `${bestMatch.answer}\n\n(You asked for ${requestedQuantity} — the Village Hub only has 1 example of this stored locally right now. I've queued this question so the next Data Mule Sync can bring back more.)`,
        unresolved: true,
      };
    }
    return {
      subject: null,
      text: `Ndine ruzivo rushoma pamusoro peizvi pa-Village Hub parizvino — kwete ${requestedQuantity} sezvawakumbira. Ndakuchengetedza mubvunzo wako kuti nditsvage zvakawanda pa-internet mushure meDataMule Sync inotevera.`,
      unresolved: true,
    };
  }

  if (bestMatch && bestScore >= 1) {
    return { subject: bestMatch.subject, text: bestMatch.answer, unresolved: false };
  }

  return { subject: null, text: FALLBACK_RESPONSE, unresolved: true };
}

export function getAllSubjects() {
  return [...new Set(KNOWLEDGE_BASE.map((e) => e.subject))];
}

export const SAMPLE_QUESTIONS = [
  'Explain quadratic equations',
  'How does photosynthesis work?',
  'Ndoda kubatsirwa ne Mabviro Nemauto',
  "What is Newton's Second Law?",
  'How do I balance a chemical equation with acids and bases?',
  'What is the accounting equation?',
];