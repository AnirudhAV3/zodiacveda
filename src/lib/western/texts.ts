import { SIGN_ELEMENT, SIGN_MODE, SIGN_NAMES, type WesternBody } from "./data";

export const SUN_SIGN = [
  "Aries Sun lives as a spark: you recognise yourself when you are first, brave and in motion. Identity is a contest you intend to win with honesty and heat.",
  "Taurus Sun lives as a maker: you recognise yourself when life is solid, beautiful and earned. Identity is the garden you refuse to abandon.",
  "Gemini Sun lives as a messenger: you recognise yourself in conversation, variety and the next interesting question. Identity is a network of ideas.",
  "Cancer Sun lives as a keeper: you recognise yourself when someone is fed, protected and remembered. Identity is a home with a tide.",
  "Leo Sun lives as a flame on a stage: you recognise yourself when your heart is seen and your generosity has an audience. Identity is creative royalty.",
  "Virgo Sun lives as a craftsman of the real: you recognise yourself when a problem is analysed, improved and made useful. Identity is service with standards.",
  "Libra Sun lives as a balancer: you recognise yourself in partnership, beauty and a fair argument. Identity is the art of relating.",
  "Scorpio Sun lives as a depth charge: you recognise yourself when a secret is faced and a false layer is burned off. Identity is transformation with loyalty.",
  "Sagittarius Sun lives as a traveller of meaning: you recognise yourself on the road, in a big idea, in laughter that tells the truth. Identity is a quest.",
  "Capricorn Sun lives as a builder of time: you recognise yourself when effort becomes structure and a mountain has a path. Identity is earned authority.",
  "Aquarius Sun lives as a future citizen: you recognise yourself among friends of the mind, in reform, in being usefully strange. Identity is the idea of us.",
  "Pisces Sun lives as a tide: you recognise yourself in music, mercy, dream and the places where edges dissolve. Identity is compassion with a compass — if you keep one.",
];

export const MOON_SIGN = [
  "Aries Moon needs action before the feeling goes stale. Safety is a clear fight, a fast decision, a body that is allowed to move.",
  "Taurus Moon needs slowness, touch, food and a room that does not change every week. Safety is sensory and loyal.",
  "Gemini Moon needs to talk the feeling into sense. Safety is information, a sibling-spirit, and more than one way out.",
  "Cancer Moon needs to nest. Safety is memory, mothering (given or received), and a tide you can predict.",
  "Leo Moon needs to be warmed in public. Safety is praise that is real, play, and a heart that is allowed to be large.",
  "Virgo Moon needs order in the small things. Safety is a useful routine, clean systems, and being needed for competence.",
  "Libra Moon needs company and fairness. Safety is a beautiful room and a partner who will discuss the temperature.",
  "Scorpio Moon needs emotional honesty at depth. Safety is one or two bonds that could survive a crisis — not a crowd.",
  "Sagittarius Moon needs horizon. Safety is a belief, a laugh, and the right to leave when the story gets too small.",
  "Capricorn Moon needs respect and a plan. Safety is being the adult in the room, even when you wish someone else would be.",
  "Aquarius Moon needs space inside closeness. Safety is friendship, ideas, and not being crowded by other people’s weather.",
  "Pisces Moon needs music, water, kindness and a door that can close. Safety is spiritual, porous, and easily flooded — boundaries are medicine.",
];

export const RISING_SIGN = [
  "Aries rising meets the world head-first: direct eyes, quick start, little patience for preamble. People feel your heat before your plan.",
  "Taurus rising meets the world as a calm body in a room: unhurried voice, physical presence, a preference for the proven. People feel they can sit down.",
  "Gemini rising meets the world talking: lively face, darting attention, a joke or a question ready. People feel the air move.",
  "Cancer rising meets the world sideways at first, then with care: a protective manner, mood you can read if you look. People feel looked after — or scanned.",
  "Leo rising meets the world as if a light just found them: warmth, posture, a little theatre. People feel they should applaud or follow.",
  "Virgo rising meets the world with a precise eye: neat signals, helpfulness, a critique already forming. People feel assessed, often usefully.",
  "Libra rising meets the world charmingly: grace, symmetry, a diplomat’s pause. People feel considered — and slightly mirrored.",
  "Scorpio rising meets the world as a still pool: few wasted gestures, a private intensity. People feel seen more deeply than they planned.",
  "Sagittarius rising meets the world like a traveller at a gate: open stride, blunt honesty, appetite. People feel a breeze from somewhere larger.",
  "Capricorn rising meets the world with a composed spine: competent, reserved, older than the years. People feel they should be professional.",
  "Aquarius rising meets the world at a slightly unusual angle: friendly, detached, original. People feel a future walking in.",
  "Pisces rising meets the world as weather: soft edges, receptive face, a dream in the eyes. People feel they could tell you a secret.",
];

export const PLANET_SIGN: Record<Exclude<WesternBody, "North Node" | "South Node">, string[]> = {
  Sun: SUN_SIGN,
  Moon: MOON_SIGN,
  Mercury: [
    "Mercury in Aries thinks in thrusts: fast conclusions, blunt words, a mind that wants a fight it can win.",
    "Mercury in Taurus thinks slowly and keeps what it learns. Speech is measured; stubborn facts beat clever theories.",
    "Mercury in Gemini is in domicile: dual, curious, witty, easily bored, a natural network of sentences.",
    "Mercury in Cancer thinks in memories and moods. Logic arrives with a feeling attached; family stories are data.",
    "Mercury in Leo speaks to be heard. Ideas want a stage; pride sits in the voice; teaching becomes performance.",
    "Mercury in Virgo is in domicile and exaltation: analysis, craft, lists, and a mind that repairs what it notices.",
    "Mercury in Libra thinks in pairs. Decisions delay until both sides have a chair; style matters as much as content.",
    "Mercury in Scorpio thinks in X-rays. Small talk dies; research, secrets and strategic silence take over.",
    "Mercury in Sagittarius thinks in theses and punchlines. Details are servants of the big idea; honesty can be too large.",
    "Mercury in Capricorn thinks like an architect: structure, timing, useful pessimism, words that carry weight.",
    "Mercury in Aquarius thinks in systems and future slang. Detached brilliance; the opinion of the group is a puzzle to hack.",
    "Mercury in Pisces thinks in images and music. Facts swim; poetry and empathy translate what linear language cannot.",
  ],
  Venus: [
    "Venus in Aries loves as a dare: chase, spark, independence. Affection is honest and impatient.",
    "Venus in Taurus is in domicile: sensual, loyal, slow to leave, expensive in the best sense — quality over novelty.",
    "Venus in Gemini loves conversation. Flirtation is intellectual; variety is a love language; boredom is the enemy.",
    "Venus in Cancer loves by feeding and remembering. Romance is a nest; loyalty is tidal and fierce when family is involved.",
    "Venus in Leo loves as theatre and tribute. Warmth is lavish; the heart wants to be the favourite, and to make others feel that way.",
    "Venus in Virgo loves through useful care. Devotion looks like fixing, crafting, noticing the detail nobody else did.",
    "Venus in Libra is in domicile: partnership as art, diplomacy as eros, a hunger for grace and a fair witness.",
    "Venus in Scorpio loves without anaesthesia. Jealousy, fusion, and truth-or-dare intimacy; half-measures feel like insult.",
    "Venus in Sagittarius loves a fellow traveller. Freedom is attractive; sermons about meaning can become the courtship.",
    "Venus in Capricorn loves what lasts. Status, loyalty, and the long game; affection is shown as reliability.",
    "Venus in Aquarius loves as friendship with voltage. Unconventional bonds, space inside closeness, ideals as perfume.",
    "Venus in Pisces is in exaltation: romantic, boundary-soft, artistic, ready to save or be saved. Discernment is the work.",
  ],
  Mars: [
    "Mars in Aries is in domicile: clean heat, fast yes, little leftover resentment if the fight was fair.",
    "Mars in Taurus is slow to start and almost impossible to stop. Anger is stubborn; desire wants a body and a result.",
    "Mars in Gemini fights with words and options. Energy scatters unless a project has chapters; wit is a weapon.",
    "Mars in Cancer fights for the nest. Indirect, protective, mood-driven; the crab’s claw holds what it loves.",
    "Mars in Leo fights for honour and creative pride. Courage is theatrical; loyalty is a hill to die on.",
    "Mars in Virgo fights mess and incompetence. Energy goes into craft, health, and precise correction.",
    "Mars in Libra is in detriment: assertion is diplomatically delayed, then aesthetic. Conflict is hardest — and most needed — here.",
    "Mars in Scorpio is in domicile (traditional): strategic, relentless, private. Desire and anger share a basement.",
    "Mars in Sagittarius fights for a belief. Heat is adventurous, preachy, or sporting; the crusade needs a worthy map.",
    "Mars in Capricorn is in exaltation: disciplined force, timed ambition, anger that becomes a career if you let it.",
    "Mars in Aquarius fights for the principle and the group’s future. Detached courage; rebellion with a blueprint.",
    "Mars in Pisces fights in fog: martyrdom, music, hidden effort. Direct conflict is avoided until it floods.",
  ],
  Jupiter: [
    "Jupiter in Aries grows through pioneering. Luck follows the first step, not the committee.",
    "Jupiter in Taurus grows through patience, land, and the compounding of simple good habits.",
    "Jupiter in Gemini grows through learning networks. Too many doors can be the only problem.",
    "Jupiter in Cancer is in exaltation: growth through care, family, and feeding the world you belong to.",
    "Jupiter in Leo grows through creativity and generosity that is seen. Pride is a teacher if it stays kind.",
    "Jupiter in Virgo grows through craft and useful service. The sermon is a checklist.",
    "Jupiter in Libra grows through alliance, art and justice. The courtroom and the gallery both count.",
    "Jupiter in Scorpio grows through crisis well-handled, other people’s resources, and psychological honesty.",
    "Jupiter in Sagittarius is in domicile: faith, travel, teaching, the long road as a moral act.",
    "Jupiter in Capricorn is in fall: growth is earned, sober, institutional. Wisdom looks like work.",
    "Jupiter in Aquarius grows through communities of the future and ideas bigger than one biography.",
    "Jupiter in Pisces is in domicile (traditional): mercy, imagination, spiritual surplus — and the need for a shoreline.",
  ],
  Saturn: [
    "Saturn in Aries learns patience in the land of impulse. Authority is self-started, or it hurts.",
    "Saturn in Taurus learns the long economics of enough. Security is built, not wished.",
    "Saturn in Gemini learns to commit the mind. One craft of language beats a thousand tabs.",
    "Saturn in Cancer learns to parent the inner child without freezing the heart. Duty at home is the classroom.",
    "Saturn in Leo learns humility inside pride. Creative authority must be practised, not performed only.",
    "Saturn in Virgo learns that perfect is the enemy of done — and also that standards are love.",
    "Saturn in Libra is in exaltation: commitment in relationship, justice with a spine, contracts that mean it.",
    "Saturn in Scorpio learns to share power without going underground. Trust is the apprenticeship.",
    "Saturn in Sagittarius learns to make a philosophy that can survive Monday morning.",
    "Saturn in Capricorn is in domicile: vocation as mountain, time as ally, ambition with bones.",
    "Saturn in Aquarius is in domicile (traditional): responsibility to the collective, structures for freedom.",
    "Saturn in Pisces learns boundaries in the ocean. Compassion needs a clock and a door.",
  ],
  Uranus: [
    "Uranus in Aries electrifies identity: sudden self-reinventions, pioneer shocks, a generation that starts things.",
    "Uranus in Taurus revolutionises value, money, land and the body’s comfort — instability in the supposedly solid.",
    "Uranus in Gemini rewires language, media, and the neighbourhood of ideas.",
    "Uranus in Cancer upends family scripts and the meaning of home; belonging becomes experimental.",
    "Uranus in Leo innovates performance, children of the future, and creative risk.",
    "Uranus in Virgo disrupts work, health systems and the cult of efficiency.",
    "Uranus in Libra rewrites partnership contracts and the politics of fairness.",
    "Uranus in Scorpio detonates taboos around sex, debt and shared power.",
    "Uranus in Sagittarius shocks belief, borders and the university of the world.",
    "Uranus in Capricorn cracks institutions; new bones for old governments and companies.",
    "Uranus in Aquarius is in domicile: the signature of networks, rights, and the science of us.",
    "Uranus in Pisces wakes the dream: spiritual experiments, film, and the internet of souls.",
  ],
  Neptune: [
    "Neptune in Aries fogs and inspires the warrior: spiritual courage, confused anger, a myth of the self.",
    "Neptune in Taurus dissolves and sanctifies matter: money dreams, green mysticism, beautiful appetite.",
    "Neptune in Gemini mystifies language: poetry, rumours, a generation of storytellers.",
    "Neptune in Cancer is at home in the tide of family feeling and national mood.",
    "Neptune in Leo glamourises the heart: cinema, idols, creative devotion.",
    "Neptune in Virgo seeks the sacred in craft and the wound in perfectionism.",
    "Neptune in Libra dreams the perfect other; art and peace as intoxication.",
    "Neptune in Scorpio fuses with the underworld: occult glamour, financial fog, erotic mysticism.",
    "Neptune in Sagittarius pilgrimages: guru weather, borderless faith, beautiful propaganda.",
    "Neptune in Capricorn dissolves old authority and dreams a more soulful structure.",
    "Neptune in Aquarius networks the dream: humanitarian ideals, digital ether, the hive mind.",
    "Neptune in Pisces is in domicile: a generation swimming in images, empathy, and the need to choose a shore.",
  ],
  Pluto: [
    "Pluto in Aries (rare in living charts) compounds identity crises into rebirths of will.",
    "Pluto in Taurus transforms wealth, ecology and what a culture calls valuable.",
    "Pluto in Gemini transforms information, twins of meaning, and the power of the story.",
    "Pluto in Cancer transformed the family, nation and emotional security of a generation.",
    "Pluto in Leo transformed performance, children, and the cult of the star.",
    "Pluto in Virgo transformed work, medicine and the analysis of the body.",
    "Pluto in Libra transformed marriage, law and the balance of power between people.",
    "Pluto in Scorpio is in domicile: a generation fluent in crisis, intimacy and financial underworlds.",
    "Pluto in Sagittarius transformed belief, globalisation and the preacher’s microphone.",
    "Pluto in Capricorn is composting institutions: governments, corporations, the mountain itself.",
    "Pluto in Aquarius will transform the network, the crowd, and what a human is among machines.",
    "Pluto in Pisces (future/past) transforms the ocean of meaning itself.",
  ],
};

export const DECAN_NOTE = [
  ["early Aries (Mars)", "middle Aries (Sun)", "late Aries (Venus)"],
  ["early Taurus (Mercury)", "middle Taurus (Moon)", "late Taurus (Saturn)"],
  ["early Gemini (Jupiter)", "middle Gemini (Mars)", "late Gemini (Sun)"],
  ["early Cancer (Venus)", "middle Cancer (Mercury)", "late Cancer (Moon)"],
  ["early Leo (Saturn)", "middle Leo (Jupiter)", "late Leo (Mars)"],
  ["early Virgo (Sun)", "middle Virgo (Venus)", "late Virgo (Mercury)"],
  ["early Libra (Moon)", "middle Libra (Saturn)", "late Libra (Jupiter)"],
  ["early Scorpio (Mars)", "middle Scorpio (Sun)", "late Scorpio (Venus)"],
  ["early Sagittarius (Mercury)", "middle Sagittarius (Moon)", "late Sagittarius (Saturn)"],
  ["early Capricorn (Jupiter)", "middle Capricorn (Mars)", "late Capricorn (Sun)"],
  ["early Aquarius (Venus)", "middle Aquarius (Mercury)", "late Aquarius (Moon)"],
  ["early Pisces (Saturn)", "middle Pisces (Jupiter)", "late Pisces (Mars)"],
];

export function planetInHouse(id: WesternBody, house: number): string {
  const where = [
    "in the 1st house it colours the whole personality and body language.",
    "in the 2nd house it works through money, talent and what you will not give away.",
    "in the 3rd house it works through speech, siblings, study and the local map.",
    "in the 4th house it works through family, home, land and the private night of the life.",
    "in the 5th house it works through love affairs, art, children and risk.",
    "in the 6th house it works through job, health, skill and the daily repair of life.",
    "in the 7th house it works through partners, clients and the face you meet in others.",
    "in the 8th house it works through shared money, sex, grief and psychological depth.",
    "in the 9th house it works through belief, travel, law and the bigger classroom.",
    "in the 10th house it works through vocation, reputation and public authority.",
    "in the 11th house it works through friends, audiences and the future you help invent.",
    "in the 12th house it works behind the scenes: rest, dream, hidden service and release.",
  ];
  return `${id} ${where[house - 1]}`;
}

export function elementEssay(counts: Record<string, number>) {
  const max = Math.max(...Object.values(counts));
  const min = Math.min(...Object.values(counts));
  const dominant = Object.entries(counts).filter(([, n]) => n === max).map(([k]) => k);
  const weak = Object.entries(counts).filter(([, n]) => n === min).map(([k]) => k);
  return {
    dominant,
    weak,
    text: `Your chart leans ${dominant.join(" and ")} (${max} placements). ${weak.join(" and ")} ${weak.length > 1 ? "are" : "is"} quieter (${min}). Fire wants action, Earth wants results, Air wants conversation, Water wants emotional truth — feed the quiet element on purpose.`,
  };
}

export function modeEssay(counts: Record<string, number>) {
  const max = Math.max(...Object.values(counts));
  const dominant = Object.entries(counts).filter(([, n]) => n === max).map(([k]) => k);
  return {
    dominant,
    text: `Modality leans ${dominant.join(" and ")}. Cardinal signs start, Fixed signs persist, Mutable signs adapt. A strong Cardinal chart initiates; a strong Fixed chart finishes; a strong Mutable chart translates.`,
  };
}

export function signName(i: number) {
  return SIGN_NAMES[i];
}

export function signFlavour(i: number) {
  return `${SIGN_NAMES[i]} · ${SIGN_ELEMENT[i]} · ${SIGN_MODE[i]}`;
}
