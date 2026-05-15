import React from 'react'
import { motion } from 'framer-motion'
import { resultVariants } from '../animations/motionVariants.js'
import styles from './ResultCard.module.css'

export default function ResultCard({ won, word, details, loading, langConfig, onClose, onNext }) {
  const lc = langConfig
  const transWord = details?.translation_word || ''
  const transExpl = details?.translation_explanation || ''

  return (
    <motion.div
      className={styles.card}
      variants={resultVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Status */}
      <div className={styles.statusRow}>
        <div className={`${styles.icon} ${won ? styles.win : styles.lose}`}>
          {won ? '🎉' : '💀'}
        </div>
        <div>
          <div className={`${styles.heading} ${won ? styles.winText : styles.loseText}`}>
            {won ? 'Well done!' : 'Game Over'}
          </div>
          <div className={styles.sub}>
            {won ? 'You guessed the word correctly!' : 'The word has been revealed.'}
          </div>
        </div>
      </div>

      {/* Word box */}
      <div className={styles.wordBox}>
        <div className={styles.wordDisplay}>{word.toUpperCase()}</div>
        <div className={styles.wordMeta}>
          {details?.phonetic && <span>{details.phonetic}</span>}
          {details?.part_of_speech && <span> · {details.part_of_speech}</span>}
        </div>
      </div>

      {/* Definition */}
      <div className={styles.infoBlock}>
        <div className={styles.infoLbl}><span className={`${styles.dot} ${styles.blue}`}/>Definition</div>
        {loading
          ? <div className={styles.loadingRow}><div className={styles.miniSpin}/> Loading...</div>
          : <div className={styles.infoTxt}>{details?.definition || '—'}</div>
        }
      </div>

      <hr className={styles.divider}/>

      {/* Translation */}
      <div className={styles.infoBlock}>
        <div className={styles.infoLbl}>
          <span className={`${styles.dot} ${styles.green}`}/>
          {lc?.script} Translation ({lc?.label})
        </div>
        {loading
          ? <div className={styles.loadingRow}><div className={styles.miniSpin}/> Loading...</div>
          : <div className={`${styles.infoTxt} ${styles.native}`}>
              {transWord && <strong>{transWord} — </strong>}
              {transExpl}
            </div>
        }
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnS}`} onClick={onClose}>Close</button>
        <button className={`${styles.btn} ${styles.btnP}`} onClick={onNext}>Next Word →</button>
      </div>
    </motion.div>
  )
}
