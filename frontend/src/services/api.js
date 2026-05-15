const BASE = '/api'

// ── Game APIs ──────────────────────────────────────────────

/**
 * Start a new game: fetch word + hint from backend
 * GET /api/game/start/?difficulty=easy&lang=ta
 */
export async function startGameAPI(difficulty, lang) {
  const t = Date.now()
  const res = await fetch(`${BASE}/game/start/?difficulty=${difficulty}&lang=${lang}&t=${t}`)
  if (!res.ok) throw new Error('Failed to start game')
  return res.json()
  // Returns: { word_length, hint, category, part_of_speech, masked_word }
}

/**
 * Submit a letter guess
 * POST /api/game/guess/
 */
export async function guessLetterAPI(sessionId, letter) {
  const res = await fetch(`${BASE}/game/guess/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, letter }),
  })
  if (!res.ok) throw new Error('Guess failed')
  return res.json()
  // Returns: { correct, masked_word, wrong_count, game_over, won }
}

/**
 * Get current game status
 * GET /api/game/status/?session_id=xxx
 */
export async function getStatusAPI(sessionId) {
  const res = await fetch(`${BASE}/game/status/?session_id=${sessionId}`)
  if (!res.ok) throw new Error('Status fetch failed')
  return res.json()
  // Returns: { guessed_letters, wrong_count, masked_word, game_over }
}

/**
 * End game — fetch full word details (meaning, translation, example)
 * POST /api/game/end/
 */
export async function endGameAPI(word, lang) {
  const res = await fetch(`${BASE}/game/end/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, lang }),
  })
  if (!res.ok) throw new Error('End game API failed')
  return res.json()
  // Returns: { definition, example, phonetic, part_of_speech, translation_word, translation_explanation }
}

// ── Direct Claude API fallback (when Django backend not running) ──────────

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

const DIFF_PROMPTS = {
  easy:   'Give a random simple English vocabulary word (A2-B1 level), 4-7 letters. Avoid common examples like "brave". Return ONLY a JSON object: {"word":"...","hint":"one cryptic clue sentence, no synonyms","category":"...","partOfSpeech":"..."}',
  medium: 'Give a random B2-level English vocabulary word, 5-9 letters. Pick something unique. Return ONLY a JSON object: {"word":"...","hint":"cryptic clue 12-15 words","category":"...","partOfSpeech":"..."}',
  hard:   'Give an advanced, rare C1/C2 English vocabulary word, 7+ letters. Return ONLY a JSON object: {"word":"...","hint":"abstract cryptic clue only","category":"...","partOfSpeech":"..."}',
}

const LANG_MAP = {
  ta: { label: 'Tamil',     key: 'tamil',     script: 'தமிழ்' },
  hi: { label: 'Hindi',     key: 'hindi',     script: 'हिन्दी' },
  te: { label: 'Telugu',    key: 'telugu',    script: 'తెలుగు' },
  ml: { label: 'Malayalam', key: 'malayalam', script: 'മലയാളം' },
}

async function claudePost(prompt, maxTokens = 400) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = data.content?.find(c => c.type === 'text')?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

/** Fetch word directly from Claude (no backend) */
export async function fetchWordDirect(difficulty) {
  return claudePost(DIFF_PROMPTS[difficulty] + '\nSeed: ' + Math.random())
}

/** Fetch word details directly from Claude (no backend) */
export async function fetchDetailsDirect(word, lang) {
  const lc = LANG_MAP[lang] || LANG_MAP.ta
  const prompt = `For the English word "${word}", return ONLY a JSON object with no extra text:
{
  "definition": "clear 1-2 sentence meaning",
  "example": "natural example sentence using the word",
  "phonetic": "/phonetic/ like /ɪˈfem.ər.əl/",
  "partOfSpeech": "noun/verb/adjective etc",
  "${lc.key}_word": "the ${lc.label} equivalent word(s) in ${lc.script} script",
  "${lc.key}_explanation": "brief explanation in ${lc.label} script (1 sentence in ${lc.script})"
}`
  const data = await claudePost(prompt, 600)
  return { ...data, langKey: lc.key, langLabel: lc.label, langScript: lc.script }
}

export const LANG_CONFIG = LANG_MAP
export const DIFF_CONFIG = {
  easy:   { lives: 8,  label: 'Easy',   cls: 'easy' },
  medium: { lives: 6,  label: 'Medium', cls: 'medium' },
  hard:   { lives: 4,  label: 'Hard',   cls: 'hard' },
}

export const FALLBACK_WORDS = {
  easy: [
    { word: 'BRAVE',   hint: 'The knight showed this when facing the dragon.',    category: 'Character' },
    { word: 'GENTLE',  hint: 'A touch so soft it would not startle a butterfly.', category: 'Character' },
    { word: 'CLEVER',  hint: 'What foxes in fables always seem to be.',           category: 'Mind' },
    { word: 'BRIGHT',  hint: 'Opposite of dim, or someone very smart.',           category: 'Adjective' },
    { word: 'SIMPLE',  hint: 'Not complex; easy to understand.',                 category: 'Adjective' },
    { word: 'DANGER',  hint: 'Something that could cause harm or injury.',        category: 'Nouns' },
    { word: 'FRIEND',  hint: 'A person you know well and like.',                  category: 'People' },
    { word: 'WONDER',  hint: 'A feeling of surprise and admiration.',             category: 'Emotion' },
  ],
  medium: [
    { word: 'ELOQUENT',  hint: 'This quality makes speeches powerful and persuasive.', category: 'Communication' },
    { word: 'TENACIOUS', hint: 'The quality that keeps a bulldog holding on.',          category: 'Character' },
    { word: 'CATALYST',  hint: 'Something that sparks rapid change without being consumed.', category: 'Science' },
    { word: 'AMBIGUOUS', hint: 'When something has more than one possible meaning.',     category: 'Logic' },
    { word: 'PRAGMATIC', hint: 'Dealing with things sensibly and realistically.',       category: 'Mindset' },
    { word: 'RESILIENT', hint: 'Able to withstand or recover quickly from difficult conditions.', category: 'Character' },
    { word: 'SOLITUDE',  hint: 'The state of being alone, usually by choice.',          category: 'State' },
    { word: 'VIBRANT',   hint: 'Full of energy, life, and bright colors.',             category: 'Adjective' },
  ],
  hard: [
    { word: 'EPHEMERAL',     hint: 'Like morning dew that vanishes before noon.',          category: 'Academic' },
    { word: 'MELLIFLUOUS',   hint: 'Sound that flows like honey poured from a jar.',       category: 'Arts' },
    { word: 'PERSPICACIOUS', hint: 'What detectives must be to see the unseen truth.',     category: 'Mind' },
    { word: 'UBIQUITOUS',    hint: 'Present, appearing, or found everywhere.',            category: 'Academic' },
    { word: 'CACOPHONY',     hint: 'A harsh, discordant mixture of sounds.',              category: 'Sounds' },
    { word: 'SURREPTITIOUS', hint: 'Kept secret, especially because it would not be approved of.', category: 'Behavior' },
    { word: 'ENIGMATIC',     hint: 'Difficult to interpret or understand; mysterious.',    category: 'Mind' },
    { word: 'PARADIGM',      hint: 'A typical example or pattern of something; a model.', category: 'Science' },
  ],
}
