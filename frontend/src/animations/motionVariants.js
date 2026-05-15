// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.34, 1.1, 0.64, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

// Letter reveal pop
export const letterVariants = {
  hidden:  { scale: 0, rotate: -10, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
}

// Result modal slide-up
export const resultVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit:    { opacity: 0, y: 10, transition: { duration: 0.2 } },
}

// Stagger children
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

// Keyboard key
export const keyVariants = {
  initial: { scale: 1 },
  tap:     { scale: 0.92 },
}

// Shake (wrong guess) — used via animate prop
export const shakeVariants = {
  shake: {
    x: [-6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
  still: { x: 0 },
}

// Hangman body part appear
export const bodyPartVariants = {
  hidden:  { opacity: 0, pathLength: 0 },
  visible: { opacity: 1, pathLength: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

// Setup option button
export const optionVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap:   { scale: 0.97 },
}

// Dot life indicators
export const dotVariants = {
  active:  { scale: 1, backgroundColor: '#2D7A3A' },
  used:    { scale: 0.85, backgroundColor: '#C4421A', transition: { type: 'spring', stiffness: 500 } },
}

// Toast notification
export const toastVariants = {
  hidden:  { opacity: 0, y: 40, x: '-50%' },
  visible: { opacity: 1, y: 0, x: '-50%', transition: { type: 'spring', stiffness: 400, damping: 28 } },
  exit:    { opacity: 0, y: 20, x: '-50%', transition: { duration: 0.2 } },
}
