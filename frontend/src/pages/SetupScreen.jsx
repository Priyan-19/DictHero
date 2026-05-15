import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { pageVariants, optionVariants, staggerContainer } from '../animations/motionVariants.js'
import styles from './SetupScreen.module.css'

const DIFFICULTIES = [
  { id: 'easy',   icon: '🟢', name: 'Easy',   desc: '8 lives · A2-B1 words' },
  { id: 'medium', icon: '🟡', name: 'Medium', desc: '6 lives · B2 vocab' },
  { id: 'hard',   icon: '🔴', name: 'Hard',   desc: '4 lives · C1/C2 words' },
]

const LANGUAGES = [
  { id: 'ta', icon: '🇮🇳', name: 'Tamil',     native: 'தமிழ்' },
  { id: 'hi', icon: '🇮🇳', name: 'Hindi',     native: 'हिन्दी' },
  { id: 'te', icon: '🇮🇳', name: 'Telugu',    native: 'తెలుగు' },
  { id: 'ml', icon: '🇮🇳', name: 'Malayalam', native: 'മലയാളം' },
]

export default function SetupScreen({ onStart }) {
  const [diff, setDiff] = useState('easy')
  const [lang, setLang] = useState('ta')

  return (
    <motion.div
      className={styles.screen}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Dict<span className={styles.accent}>Hero</span>
        </h1>
        <p className={styles.sub}>
          Guess the word. Learn its meaning.<br/>Discover it in your language.
        </p>
      </div>

      {/* Difficulty */}
      <section className={styles.section}>
        <div className={styles.sectionLbl}>Difficulty</div>
        <motion.div
          className={`${styles.grid} ${styles.three}`}
          variants={staggerContainer}
          animate="animate"
        >
          {DIFFICULTIES.map(d => (
            <motion.button
              key={d.id}
              className={`${styles.optBtn} ${diff === d.id ? styles.sel : ''}`}
              variants={optionVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setDiff(d.id)}
            >
              <span className={styles.optIcon}>{d.icon}</span>
              <span className={styles.optName}>{d.name}</span>
              <span className={styles.optDesc}>{d.desc}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Language */}
      <section className={styles.section}>
        <div className={styles.sectionLbl}>Translation Language</div>
        <div className={`${styles.grid} ${styles.two}`}>
          {LANGUAGES.map(l => (
            <motion.button
              key={l.id}
              className={`${styles.optBtn} ${lang === l.id ? styles.sel : ''}`}
              variants={optionVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setLang(l.id)}
            >
              <span className={styles.optIcon}>{l.icon}</span>
              <span className={styles.optName}>{l.name}</span>
              <span className={styles.optDesc}>{l.native}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <motion.button
        className={styles.playBtn}
        whileHover={{ backgroundColor: '#C4421A' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart({ diff, lang })}
      >
        Start Playing
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2 7.5h11M7.5 2l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>
    </motion.div>
  )
}
