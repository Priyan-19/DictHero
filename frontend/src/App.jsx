import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SetupScreen from './pages/SetupScreen.jsx'
import GameScreen from './pages/GameScreen.jsx'
import Header from './components/Header.jsx'
import styles from './App.module.css'

export default function App() {
  const [screen, setScreen] = useState('setup') // 'setup' | 'game'
  const [config, setConfig] = useState({ diff: 'easy', lang: 'ta' })
  const [scores, setScores] = useState({ wins: 0, losses: 0, streak: 0 })

  function handleStart(cfg) {
    setConfig(cfg)
    setScreen('game')
  }

  function handleGameEnd(won) {
    setScores(prev => ({
      wins: prev.wins + (won ? 1 : 0),
      losses: prev.losses + (won ? 0 : 1),
      streak: won ? prev.streak + 1 : 0,
    }))
  }

  function handleBackToSetup() {
    setScreen('setup')
  }

  return (
    <div className={styles.app}>
      {screen === 'game' && <Header scores={scores} />}
      <AnimatePresence mode="wait">
        {screen === 'setup' ? (
          <SetupScreen key="setup" onStart={handleStart} />
        ) : (
          <GameScreen
            key="game"
            config={config}
            onGameEnd={handleGameEnd}
            onBack={handleBackToSetup}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
