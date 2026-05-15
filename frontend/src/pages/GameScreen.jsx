import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameBoard from '../components/GameBoard.jsx'
import Keyboard from '../components/Keyboard.jsx'
import ResultCard from '../components/ResultCard.jsx'
import {
  startGameAPI,
  endGameAPI,
  DIFF_CONFIG,
  LANG_CONFIG,
  FALLBACK_WORDS,
} from '../services/api.js'
import { pageVariants, letterVariants, shakeVariants, toastVariants } from '../animations/motionVariants.js'
import styles from './GameScreen.module.css'

export default function GameScreen({ config, onGameEnd, onBack }) {
  const { diff, lang } = config
  const diffCfg = DIFF_CONFIG[diff]
  const langCfg = LANG_CONFIG[lang]

  const [word, setWord]         = useState('')
  const [hint, setHint]         = useState('')
  const [category, setCategory] = useState('')
  const [guessed, setGuessed]   = useState(new Set())
  const [wrong, setWrong]       = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon]           = useState(false)
  const [loading, setLoading]   = useState(true)
  const [shaking, setShaking]   = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [details, setDetails]   = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [toast, setToast]       = useState(null)
  const toastTimer = useRef(null)

  const maxWrong = diffCfg.lives

  // ── Load word on mount ──
  useEffect(() => {
    loadWord()
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  // ── Physical keyboard ──
  useEffect(() => {
    const handler = (e) => {
      const k = e.key.toUpperCase()
      if (/^[A-Z]$/.test(k) && !gameOver && !loading) handleGuess(k)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameOver, loading, guessed, word])

  async function loadWord() {
    setLoading(true)
    setWord(''); setHint(''); setCategory(''); setGuessed(new Set())
    setWrong(0); setGameOver(false); setWon(false)
    setHintUsed(false); setShowResult(false); setDetails(null)
    try {
      const data = await startGameAPI(diff, lang)
      setWord((data.word || 'eloquent').toUpperCase())
      setHint(data.hint || 'A vocabulary word to discover.')
      setCategory(data.category || 'Vocabulary')
    } catch {
      const fb = [...FALLBACK_WORDS[diff]]
      // Shuffle fallback list to avoid repetitive order
      for (let i = fb.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fb[i], fb[j]] = [fb[j], fb[i]];
      }
      const pick = fb[0]
      setWord(pick.word)
      setHint(pick.hint)
      setCategory(pick.category)
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  const handleGuess = useCallback((letter) => {
    if (gameOver || loading || guessed.has(letter)) return
    const newGuessed = new Set(guessed)
    newGuessed.add(letter)
    setGuessed(newGuessed)

    const wordUp = word.toUpperCase()
    if (wordUp.includes(letter)) {
      // Check win
      const allDone = [...wordUp.replace(/ /g, '')].every(c => newGuessed.has(c))
      if (allDone) triggerEnd(true, newGuessed)
    } else {
      const newWrong = wrong + 1
      setWrong(newWrong)
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      if (newWrong >= maxWrong) triggerEnd(false, newGuessed)
    }
  }, [gameOver, loading, guessed, word, wrong, maxWrong])

  function triggerEnd(didWin, finalGuessed) {
    setGameOver(true)
    setWon(didWin)
    // Reveal all letters
    setGuessed(prev => {
      const all = new Set(prev)
      word.toUpperCase().replace(/ /g, '').split('').forEach(c => all.add(c))
      return all
    })
    onGameEnd(didWin)
    showToast(didWin ? '🎉 Correct!' : '💀 Better luck next time!')
    setTimeout(() => {
      setShowResult(true)
      loadDetails()
    }, 700)
  }

  async function loadDetails() {
    setDetailsLoading(true)
    try {
      const data = await endGameAPI(word, lang)
      setDetails(data)
    } catch {
      setDetails({ definition: 'Could not load details.', example: '', phonetic: '' })
    } finally {
      setDetailsLoading(false)
    }
  }

  function doHint() {
    if (gameOver || loading || hintUsed) return
    const unrevealed = [...word.toUpperCase().replace(/ /g, '')].filter(c => !guessed.has(c))
    if (!unrevealed.length) return
    setHintUsed(true)
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    showToast(`💡 Revealing: ${pick}`)
    handleGuess(pick)
  }

  // Derived
  const wordLetters = word ? word.split('') : []
  const correctLetters = new Set([...guessed].filter(c => word.toUpperCase().includes(c)))
  const wrongLetters   = new Set([...guessed].filter(c => !word.toUpperCase().includes(c)))

  if (loading) {
    return (
      <motion.div className={styles.loadScreen} variants={pageVariants} initial="initial" animate="animate">
        <div className={styles.bigSpin}/>
        <div className={styles.loadTxt}>Fetching your word...</div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className={styles.layout}>
        {/* LEFT — hangman + hint */}
        <GameBoard
          wrongCount={wrong}
          maxWrong={maxWrong}
          hint={hint}
          category={category}
          diffLabel={diffCfg.label}
          diffCls={diffCfg.cls}
          langLabel={langCfg.label}
        />

        {/* RIGHT */}
        <div className={styles.rightPanel}>
          {/* Word slots */}
          <div className={styles.wordCard}>
            <motion.div
              className={styles.wordRow}
              animate={shaking ? 'shake' : 'still'}
              variants={shakeVariants}
            >
              {wordLetters.map((ch, i) => {
                if (ch === ' ') return <div key={i} className={styles.space}/>
                const isRevealed = guessed.has(ch.toUpperCase())
                return (
                  <div key={i} className={styles.letterSlot}>
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          className={styles.letterChar}
                          variants={letterVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {ch.toUpperCase()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isRevealed && <div className={styles.letterBlank}/>}
                    <div className={`${styles.underline} ${isRevealed ? styles.underlineGreen : ''}`}/>
                  </div>
                )
              })}
            </motion.div>
            <div className={styles.wordMeta}>
              {word.replace(/ /g, '').length} letters
              {word.includes(' ') && ` · ${word.trim().split(/\s+/).length} words`}
            </div>
          </div>

          {/* Keyboard */}
          <Keyboard
            guessed={guessed}
            correctLetters={correctLetters}
            wrongLetters={wrongLetters}
            onGuess={handleGuess}
            disabled={gameOver || loading}
          />

          {/* Action row */}
          <div className={styles.actRow}>
            <button
              className={`${styles.btn} ${styles.btnS}`}
              onClick={doHint}
              disabled={gameOver || hintUsed || loading}
            >
              💡 {hintUsed ? 'Hint used' : 'Reveal Letter'}
            </button>
            <button className={`${styles.btn} ${styles.btnP}`} onClick={onBack}>
              ⟳ New Game
            </button>
          </div>

          {/* Result card */}
          <AnimatePresence>
            {showResult && (
              <ResultCard
                won={won}
                word={word}
                details={details}
                loading={detailsLoading}
                langConfig={langCfg}
                onClose={() => setShowResult(false)}
                onNext={() => { setShowResult(false); loadWord() }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
