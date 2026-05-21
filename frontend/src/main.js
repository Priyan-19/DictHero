import './index.css';

/* ── CORE CONSTANTS & CONFIGURATIONS ────────────────────────── */
const DIFFICULTIES = [
  { id: 'easy',   icon: '🟢', name: 'Easy',   desc: '8 lives · A2-B1 words', lives: 8 },
  { id: 'medium', icon: '🟡', name: 'Medium', desc: '6 lives · B2 vocab',    lives: 6 },
  { id: 'hard',   icon: '🔴', name: 'Hard',   desc: '4 lives · C1/C2 words', lives: 4 },
];

const LANGUAGES = [
  { id: 'ta', icon: '🇮🇳', name: 'Tamil',     native: 'தமிழ்',     label: 'Tamil',     key: 'tamil',     script: 'தமிழ்' },
  { id: 'hi', icon: '🇮🇳', name: 'Hindi',     native: 'हिन्दी',    label: 'Hindi',     key: 'hindi',     script: 'हिन्दी' },
  { id: 'te', icon: '🇮🇳', name: 'Telugu',    native: 'తెలుగు',    label: 'Telugu',    key: 'telugu',    script: 'తెలుగు' },
  { id: 'ml', icon: '🇮🇳', name: 'Malayalam', native: 'മലയാളം',   label: 'Malayalam', key: 'malayalam', script: 'മലയാളം' },
];

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const FALLBACK_WORDS = {
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
};

/* ── GAME STATE STORE ───────────────────────────────────────── */
const S = {
  screen: 'setup', // 'setup' | 'game'
  diff: 'easy',    // Selected difficulty
  lang: 'ta',      // Selected translation language
  scores: {
    wins: 0,
    losses: 0,
    streak: 0
  },
  
  // Active game session properties
  word: '',
  hint: '',
  category: '',
  guessed: new Set(),
  wrong: 0,
  gameOver: false,
  won: false,
  
  // Loaders & feedback states
  loading: false,
  hintUsed: false,
  showResult: false,
  details: null,
  detailsLoading: false,
  
  // Timers
  toastTimer: null
};

/* ── GAME ENDPOINTS API WRAPPERS ────────────────────────────── */
const API_BASE = '/api';

async function startGameAPI(difficulty, lang) {
  const t = Date.now();
  const res = await fetch(`${API_BASE}/game/start/?difficulty=${difficulty}&lang=${lang}&t=${t}`);
  if (!res.ok) throw new Error('Failed to fetch from server');
  return res.json();
}

async function endGameAPI(word, lang) {
  const res = await fetch(`${API_BASE}/game/end/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, lang }),
  });
  if (!res.ok) throw new Error('Failed to fetch from server');
  return res.json();
}

/* ── TOAST NOTIFICATION HELPER ──────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  if (S.toastTimer) clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

/* ── ENGINE INTERACTION HANDLERS (GLOBAL PATHWAYS) ──────────── */
const App = {
  // Select difficulty on setup screen
  selectDiff(id) {
    S.diff = id;
    this.render();
  },

  // Select language on setup screen
  selectLang(id) {
    S.lang = id;
    this.render();
  },

  // Transition from setup to active game
  async startGame() {
    S.screen = 'game';
    S.loading = true;
    S.word = '';
    S.hint = '';
    S.category = '';
    S.guessed = new Set();
    S.wrong = 0;
    S.gameOver = false;
    S.won = false;
    S.hintUsed = false;
    S.showResult = false;
    S.details = null;
    S.detailsLoading = false;
    
    this.render();

    try {
      const data = await startGameAPI(S.diff, S.lang);
      S.word = (data.word || 'eloquent').toUpperCase();
      S.hint = data.hint || 'A vocabulary word to discover.';
      S.category = data.category || 'Vocabulary';
    } catch (e) {
      console.warn('API Start Game failed. Loading fallback word offline.', e);
      // Retrieve fallback category list
      const fbList = [...FALLBACK_WORDS[S.diff]];
      // Shuffle array to ensure unique pick order
      for (let i = fbList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fbList[i], fbList[j]] = [fbList[j], fbList[i]];
      }
      const pick = fbList[0];
      S.word = pick.word.toUpperCase();
      S.hint = pick.hint;
      S.category = pick.category;
    } finally {
      S.loading = false;
      this.render();
    }
  },

  // Register letter guess
  guessLetter(letter) {
    if (S.gameOver || S.loading || S.guessed.has(letter)) return;
    
    // Add pop-depress visual anim to keyboard key immediately
    const keyBtn = document.getElementById(`k-${letter}`);
    if (keyBtn) {
      keyBtn.classList.add('key-press-animation');
      setTimeout(() => keyBtn.classList.remove('key-press-animation'), 150);
    }

    S.guessed.add(letter);
    
    const wordClean = S.word.replace(/\s+/g, '');
    const isHit = S.word.includes(letter);
    
    if (isHit) {
      // Check win condition
      const won = [...wordClean].every(char => S.guessed.has(char));
      if (won) {
        this.triggerGameEnd(true);
      } else {
        this.render();
      }
    } else {
      S.wrong++;
      
      // Trigger container shake animations
      const wordRow = document.getElementById('word-slots-container');
      if (wordRow) {
        wordRow.classList.add('shaking');
        setTimeout(() => wordRow.classList.remove('shaking'), 380);
      }
      
      const livesCfg = DIFFICULTIES.find(d => d.id === S.diff);
      const maxWrong = livesCfg ? livesCfg.lives : 6;
      
      if (S.wrong >= maxWrong) {
        this.triggerGameEnd(false);
      } else {
        this.render();
      }
    }
  },

  // Handle final game results
  triggerGameEnd(didWin) {
    S.gameOver = true;
    S.won = didWin;
    
    // Fully reveal letters
    S.guessed = new Set([...S.guessed, ...S.word.replace(/\s+/g, '')]);
    
    // Adjust stats
    if (didWin) {
      S.scores.wins++;
      S.scores.streak++;
    } else {
      S.scores.losses++;
      S.scores.streak = 0;
    }
    
    showToast(didWin ? '🎉 Correct Guess!' : '💀 Better luck next time!');
    this.render();
    
    // Automatically trigger dictionary lookups
    setTimeout(() => {
      S.showResult = true;
      this.render();
      this.loadWordDetails();
    }, 700);
  },

  // Load definition details from Gemini
  async loadWordDetails() {
    S.detailsLoading = true;
    this.render();
    
    try {
      const data = await endGameAPI(S.word, S.lang);
      S.details = data;
    } catch (e) {
      console.error('Failed loading endGame metadata details.', e);
      S.details = {
        definition: 'Could not fetch dictionary definitions from server.',
        example: 'N/A',
        phonetic: 'N/A',
        translation_word: '',
        translation_explanation: 'N/A'
      };
    } finally {
      S.detailsLoading = false;
      this.render();
    }
  },

  // Use a hint to reveal a random character
  revealLetter() {
    if (S.gameOver || S.loading || S.hintUsed) return;
    
    const wordClean = S.word.replace(/\s+/g, '');
    const remaining = [...wordClean].filter(char => !S.guessed.has(char));
    
    if (remaining.length === 0) return;
    
    S.hintUsed = true;
    const randomPick = remaining[Math.floor(Math.random() * remaining.length)];
    showToast(`💡 Revealing: ${randomPick}`);
    this.guessLetter(randomPick);
  },

  // Close final result card
  closeResult() {
    S.showResult = false;
    this.render();
  },

  // Advance immediately to next puzzle
  nextWord() {
    this.startGame();
  },

  // Navigate back to setup selection
  goBackToSetup() {
    S.screen = 'setup';
    this.render();
  },

  /* ── DOM RENDERING PIPELINE ───────────────────────────────── */
  render() {
    const root = document.getElementById('app-view');
    if (!root) return;

    if (S.screen === 'setup') {
      root.innerHTML = this.templateSetup();
    } else {
      root.innerHTML = this.templateGame();
    }
  },

  /* Setup Screen Template */
  templateSetup() {
    return `
      <div class="setup-view">
        <div class="hero">
          <h1 class="setup-title">Dict<span class="accent">Hero</span></h1>
          <p class="setup-sub">Guess the word. Learn its meaning.<br/>Discover it in your language.</p>
        </div>

        <!-- Difficulty Selection -->
        <section class="setup-section">
          <div class="section-lbl">Difficulty</div>
          <div class="grid grid-3">
            ${DIFFICULTIES.map(d => `
              <button class="opt-btn ${S.diff === d.id ? 'sel' : ''}" onclick="App.selectDiff('${d.id}')">
                <span class="opt-icon">${d.icon}</span>
                <span class="opt-name">${d.name}</span>
                <span class="opt-desc">${d.desc}</span>
              </button>
            `).join('')}
          </div>
        </section>

        <!-- Translation Language Selection -->
        <section class="setup-section">
          <div class="section-lbl">Translation Language</div>
          <div class="grid grid-4">
            ${LANGUAGES.map(l => `
              <button class="opt-btn ${S.lang === l.id ? 'sel' : ''}" onclick="App.selectLang('${l.id}')">
                <span class="opt-icon">${l.icon}</span>
                <span class="opt-name">${l.name}</span>
                <span class="opt-desc">${l.native}</span>
              </button>
            `).join('')}
          </div>
        </section>

        <!-- Start Trigger -->
        <button class="play-btn" onclick="App.startGame()">
          Start Playing
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 7.5h11M7.5 2l5.5 5.5-5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  },

  /* Gameplay Screen Template */
  templateGame() {
    if (S.loading) {
      return `
        <div class="load-screen">
          <div class="big-spin"></div>
          <div class="load-txt">Fetching your word...</div>
        </div>
      `;
    }

    const diffCfg = DIFFICULTIES.find(d => d.id === S.diff);
    const langCfg = LANGUAGES.find(l => l.id === S.lang);
    const maxWrong = diffCfg ? diffCfg.lives : 6;
    const livesLeft = maxWrong - S.wrong;
    const danger = S.wrong >= maxWrong - 1;

    // Derived correctly guessed vs wrong guess lists
    const correctLetters = new Set([...S.guessed].filter(c => S.word.includes(c)));
    const wrongLetters   = new Set([...S.guessed].filter(c => !S.word.includes(c)));

    return `
      <div class="game-view">
        <!-- Scoreboard Header -->
        <header class="game-hdr">
          <div class="logo-group">
            <div class="logo-box">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 16V8M10 16V3M17 16V10" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <div class="logo-name">DictHero</div>
              <div class="logo-tag">Vocabulary Builder</div>
            </div>
          </div>

          <div class="scores-group">
            <div class="streak-badge ${S.scores.streak > 0 ? 'active' : ''}">
              🔥 ${S.scores.streak} streak
            </div>
            <div class="score-stat">
              <span class="val wins">${S.scores.wins}</span>
              <span class="lbl">Wins</span>
            </div>
            <div class="score-stat">
              <span class="val losses">${S.scores.losses}</span>
              <span class="lbl">Losses</span>
            </div>
          </div>
        </header>

        <!-- Two Column Content Preserved Perfectly -->
        <div class="game-layout">
          <!-- LEFT PANEL (Hangman, Lives, Hints) -->
          <aside class="left-panel">
            <!-- Hangman State Widget -->
            <div class="game-card hg-state ${danger ? 'danger' : S.wrong > 0 ? 'safe' : ''}">
              <div class="card-badges">
                <span class="badge ${S.diff}">${diffCfg ? diffCfg.name : ''}</span>
                <span class="badge lang">${langCfg ? langCfg.name : ''}</span>
              </div>

              <!-- Vector Gallows and Hanging Man -->
              <div class="svg-container">
                <svg width="188" height="180" viewBox="0 0 200 200">
                  <!-- Ground -->
                  <line class="gallows-path" x1="20" y1="185" x2="180" y2="185"/>
                  <!-- Post -->
                  <line class="gallows-path" x1="50" y1="185" x2="50" y2="20"/>
                  <!-- Beam -->
                  <line class="gallows-path" x1="50" y1="20" x2="120" y2="20"/>
                  <!-- Rope -->
                  <line class="gallows-path" x1="120" y1="20" x2="120" y2="40"/>

                  <!-- Head -->
                  <circle class="body-path ${S.wrong >= 1 ? 'visible' : ''}" cx="120" cy="55" r="14"/>
                  <!-- Body Spine -->
                  <line class="body-path ${S.wrong >= 2 ? 'visible' : ''}" x1="120" y1="69" x2="120" y2="118"/>
                  <!-- Left Arm -->
                  <line class="body-path ${S.wrong >= 3 ? 'visible' : ''}" x1="120" y1="80" x2="96" y2="102"/>
                  <!-- Right Arm -->
                  <line class="body-path ${S.wrong >= 4 ? 'visible' : ''}" x1="120" y1="80" x2="144" y2="102"/>
                  <!-- Left Leg -->
                  <line class="body-path ${S.wrong >= 5 ? 'visible' : ''}" x1="120" y1="118" x2="96" y2="146"/>
                  <!-- Right Leg -->
                  <line class="body-path ${S.wrong >= 6 ? 'visible' : ''}" x1="120" y1="118" x2="144" y2="146"/>
                  <!-- Left Eye dead -->
                  <line class="body-path ${S.wrong >= 7 ? 'visible' : ''}" x1="116" y1="51" x2="119" y2="54"/>
                  <!-- Right Eye dead -->
                  <line class="body-path ${S.wrong >= 8 ? 'visible' : ''}" x1="121" y1="51" x2="124" y2="54"/>
                </svg>
              </div>

              <!-- Visual Dot Metrics -->
              <div class="lives-indicator">
                <div class="dots-row">
                  ${Array.from({ length: maxWrong }).map((_, i) => `
                    <div class="life-dot ${i < S.wrong ? 'used' : ''}"></div>
                  `).join('')}
                </div>
                <div class="lives-txt">${livesLeft} ${livesLeft === 1 ? 'life' : 'lives'} left</div>
              </div>
            </div>

            <!-- Hint Description Card -->
            <div class="game-card">
              <div class="hint-lbl">Word Hint</div>
              <div class="hint-txt">${S.hint || 'Fetching...'}</div>
              ${S.category ? `<span class="cat-badge">${S.category}</span>` : ''}
            </div>
          </aside>

          <!-- RIGHT PANEL (Words, Keyboards, Actions, Modals) -->
          <section class="right-panel">
            <!-- Target Word Blank Slots -->
            <div class="game-card word-box">
              <div class="word-row" id="word-slots-container">
                ${S.word.split('').map(char => {
                  if (char === ' ') return `<div class="word-space"></div>`;
                  
                  const isRevealed = S.guessed.has(char);
                  // Highlight characters the user failed to guess in red
                  const isMissed = S.gameOver && !isRevealed && !S.won;
                  
                  return `
                    <div class="letter-slot ${isMissed ? 'missed' : ''}">
                      <span class="letter-char ${isRevealed || S.gameOver ? 'revealed' : ''}">
                        ${char}
                      </span>
                      <div class="letter-underline"></div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="word-meta">
                ${S.word.replace(/\s+/g, '').length} letters 
                ${S.word.includes(' ') ? ` · ${S.word.trim().split(/\s+/).length} words` : ''}
              </div>
            </div>

            <!-- Virtual Keyboard -->
            <div class="game-card kb-card">
              <div class="kb-rows">
                ${KEYBOARD_ROWS.map(row => `
                  <div class="kb-row">
                    ${row.map(char => {
                      const hit = correctLetters.has(char);
                      const miss = wrongLetters.has(char);
                      const used = S.guessed.has(char);
                      return `
                        <button 
                          id="k-${char}"
                          class="kb-key ${hit ? 'hit' : miss ? 'miss' : ''}" 
                          ${used || S.gameOver ? 'disabled' : ''} 
                          onclick="App.guessLetter('${char}')"
                        >
                          ${char}
                        </button>
                      `;
                    }).join('')}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Interactive Buttons Row -->
            <div class="btn-row">
              <button 
                class="game-btn game-btn-secondary" 
                onclick="App.revealLetter()" 
                ${S.gameOver || S.hintUsed ? 'disabled' : ''}
              >
                💡 ${S.hintUsed ? 'Hint Used' : 'Reveal Letter'}
              </button>
              <button class="game-btn game-btn-primary" onclick="App.goBackToSetup()">
                ⟳ New Game
              </button>
            </div>

            <!-- Game Round Overlay Modal Details -->
            ${S.showResult ? this.templateResultModal(langCfg) : ''}
          </section>
        </div>
      </div>
    `;
  },

  /* Results Dialog Modal Overlay Template */
  templateResultModal(langCfg) {
    const won = S.won;
    const word = S.word;
    const details = S.details;
    const loading = S.detailsLoading;
    
    return `
      <div class="result-card">
        <div class="res-header">
          <div class="res-badge-icon ${won ? 'win' : 'lose'}">
            ${won ? '🎉' : '💀'}
          </div>
          <div>
            <div class="res-title-text ${won ? 'win' : 'lose'}">
              ${won ? 'Well done!' : 'Game Over'}
            </div>
            <div class="res-subtitle">
              ${won ? 'You guessed the word correctly!' : 'The word has been revealed.'}
            </div>
          </div>
        </div>

        <div class="res-word-showcase">
          <div class="res-reveal-word">${word}</div>
          <div class="res-phonetic-text">
            ${details?.phonetic || ''} ${details?.part_of_speech ? `· ${details.part_of_speech}` : ''} ${S.category ? `· ${S.category}` : ''}
          </div>
        </div>

        <!-- Definition Section -->
        <div class="info-block">
          <div class="info-lbl">
            <span class="info-lbl-dot blue"></span>
            Definition
          </div>
          <div class="info-content">
            ${loading ? `
              <div class="loading-row"><span class="mini-spin"></span> Loading details...</div>
            ` : (details?.definition || 'Dictionary definition not available.')}
          </div>
        </div>

        <hr class="res-divider"/>

        <!-- Multi-lingual Translations Section -->
        <div class="info-block">
          <div class="info-lbl">
            <span class="info-lbl-dot green"></span>
            ${langCfg?.script || ''} Translation (${langCfg?.name || ''})
          </div>
          <div class="info-content native">
            ${loading ? `
              <div class="loading-row"><span class="mini-spin"></span> Loading translation...</div>
            ` : `
              ${details?.translation_word ? `<strong>${details.translation_word}</strong> — ` : ''}
              ${details?.translation_explanation || 'Translation explanation not available.'}
            `}
          </div>
        </div>

        <!-- Modal Controls -->
        <div class="res-actions-grid">
          <button class="game-btn game-btn-secondary" style="flex: 0.4" onclick="App.closeResult()">Close</button>
          <button class="game-btn game-btn-primary" onclick="App.nextWord()">Next Word →</button>
        </div>
      </div>
    `;
  }
};

/* ── DOM READY LISTENERS & EVENTS ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Bind physical QWERTY keyboard listener
  window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      if (S.screen === 'game' && !S.gameOver && !S.loading) {
        App.guessLetter(key);
      }
    }
  });

  // Attach controls internally inside MacOS controls
  const closeBtn = document.querySelector('.win-ctrl.close');
  const minBtn = document.querySelector('.win-ctrl.minimize');
  const maxBtn = document.querySelector('.win-ctrl.maximize');
  
  if (closeBtn) closeBtn.onclick = () => {
    showToast('Goodbye! DictHero shutting down.');
    setTimeout(() => App.goBackToSetup(), 1000);
  };
  
  if (minBtn) minBtn.onclick = () => {
    showToast('Minimizing DictHero to system dock...');
    const win = document.querySelector('.app-window');
    if (win) {
      win.style.transform = 'scale(0.85) translateY(40px)';
      win.style.opacity = '0.5';
      setTimeout(() => {
        win.style.transform = '';
        win.style.opacity = '';
      }, 1500);
    }
  };
  
  if (maxBtn) maxBtn.onclick = () => {
    const win = document.querySelector('.app-window');
    if (win) {
      if (win.style.width === '100%') {
        win.style.width = '95%';
        win.style.height = '86vh';
        win.style.borderRadius = '20px';
        showToast('Restored window size');
      } else {
        win.style.width = '100%';
        win.style.height = '100vh';
        win.style.borderRadius = '0px';
        showToast('Maximized window workspace');
      }
    }
  };

  // Expose App namespaces to global window context for inline event mapping
  window.App = App;

  // Fire initial setup render
  App.render();
});
