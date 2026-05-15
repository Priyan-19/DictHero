const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

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

// ── End of Service ──────────────────────────────────────────

const LANG_MAP = {
  ta: { label: 'Tamil',     key: 'tamil',     script: 'தமிழ்' },
  hi: { label: 'Hindi',     key: 'hindi',     script: 'हिन्दी' },
  te: { label: 'Telugu',    key: 'telugu',    script: 'తెలుగు' },
  ml: { label: 'Malayalam', key: 'malayalam', script: 'മലയാളം' },
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
