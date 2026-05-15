import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bodyPartVariants } from '../animations/motionVariants.js'
import styles from './GameBoard.module.css'

const BODY_PARTS = [
  // head
  <motion.circle key="head" cx="120" cy="55" r="15" stroke="var(--red)" strokeWidth="2.5" fill="none"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // body
  <motion.line key="body" x1="120" y1="70" x2="120" y2="118" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // left arm
  <motion.line key="larm" x1="120" y1="82" x2="96" y2="105" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // right arm
  <motion.line key="rarm" x1="120" y1="82" x2="144" y2="105" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // left leg
  <motion.line key="lleg" x1="120" y1="118" x2="96" y2="148" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // right leg
  <motion.line key="rleg" x1="120" y1="118" x2="144" y2="148" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // left eye
  <motion.line key="leye" x1="115" y1="50" x2="118" y2="53" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
  // right eye
  <motion.line key="reye" x1="123" y1="50" x2="126" y2="53" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"
    variants={bodyPartVariants} initial="hidden" animate="visible" />,
]

export default function GameBoard({ wrongCount, maxWrong, hint, category, diffLabel, diffCls, langLabel }) {
  const livesLeft = maxWrong - wrongCount
  const danger = wrongCount >= maxWrong - 1

  return (
    <div className={styles.panel}>
      {/* Hangman card */}
      <div className={`${styles.hgCard} ${danger ? styles.danger : wrongCount > 0 ? styles.safe : ''}`}>
        <div className={styles.badges}>
          <span className={`${styles.diffBadge} ${styles[diffCls]}`}>{diffLabel}</span>
          <span className={styles.langBadge}>{langLabel}</span>
        </div>

        <div className={styles.svgWrap}>
          <svg width="200" height="190" viewBox="0 0 200 200">
            {/* Gallows */}
            <line x1="20" y1="188" x2="180" y2="188" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="188" x2="50" y2="20"  stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="20"  x2="120" y2="20" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/>
            <line x1="120" y1="20" x2="120" y2="40" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/>
            {/* Body parts rendered progressively */}
            <AnimatePresence>
              {BODY_PARTS.slice(0, wrongCount)}
            </AnimatePresence>
          </svg>
        </div>

        {/* Lives dots */}
        <div className={styles.dotsRow}>
          {Array.from({ length: maxWrong }).map((_, i) => (
            <motion.div
              key={i}
              className={styles.dot}
              animate={{ scale: i < wrongCount ? 0.8 : 1, backgroundColor: i < wrongCount ? '#C4421A' : '#2D7A3A' }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            />
          ))}
        </div>
        <div className={styles.livesLbl}>
          {livesLeft} {livesLeft === 1 ? 'life' : 'lives'} left
        </div>
      </div>

      {/* Hint card */}
      <div className={styles.hintCard}>
        <div className={styles.hintLbl}>Word Hint</div>
        <div className={styles.hintTxt}>{hint || 'Loading...'}</div>
        {category && <span className={styles.catTag}>{category}</span>}
      </div>
    </div>
  )
}
