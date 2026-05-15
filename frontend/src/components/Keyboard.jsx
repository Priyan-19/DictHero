import React from 'react'
import { motion } from 'framer-motion'
import { keyVariants } from '../animations/motionVariants.js'
import styles from './Keyboard.module.css'

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
]

export default function Keyboard({ guessed, correctLetters, wrongLetters, onGuess, disabled }) {
  return (
    <div className={styles.kbCard}>
      <div className={styles.rows}>
        {ROWS.map((row, ri) => (
          <div key={ri} className={styles.row}>
            {row.map(letter => {
              const isCorrect = correctLetters.has(letter)
              const isWrong   = wrongLetters.has(letter)
              const isUsed    = guessed.has(letter)
              return (
                <motion.button
                  key={letter}
                  className={`${styles.key} ${isCorrect ? styles.hit : isWrong ? styles.miss : ''}`}
                  variants={keyVariants}
                  whileTap="tap"
                  onClick={() => !isUsed && !disabled && onGuess(letter)}
                  disabled={isUsed || disabled}
                  aria-label={`Letter ${letter}`}
                >
                  {letter}
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
