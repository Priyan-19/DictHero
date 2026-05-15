import React from 'react'
import { motion } from 'framer-motion'
import styles from './Header.module.css'

export default function Header({ scores }) {
  const { wins, losses, streak } = scores

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 16V8M10 16V3M17 16V10" stroke="#F7F4EF" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div className={styles.logoName}>DictHero</div>
          <div className={styles.logoTag}>Vocabulary Builder</div>
        </div>
      </div>

      <div className={styles.right}>
        <motion.div
          className={`${styles.streakTag} ${streak > 0 ? styles.streakOn : ''}`}
          animate={{ scale: streak > 0 ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 0.3 }}
          key={streak}
        >
          🔥 {streak} streak
        </motion.div>
        <div className={styles.stat}>
          <span className={`${styles.val} ${styles.wins}`}>{wins}</span>
          <span className={styles.lbl}>Wins</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.val} ${styles.losses}`}>{losses}</span>
          <span className={styles.lbl}>Losses</span>
        </div>
      </div>
    </header>
  )
}
