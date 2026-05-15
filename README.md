# DictHero — Gamified English Vocabulary Builder

A production-level, fully API-driven Hangman SPA for vocabulary learning with bilingual support (Tamil, Hindi, Telugu, Malayalam).

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Framer Motion, Vite       |
| Backend    | Python 3.11, Django 4.2, DRF        |
| AI Engine  | Google Gemini (gemini-1.5-flash)    |
| No DB      | Fully stateless / API-driven        |

---

## Features

- **3 Difficulty Levels**: Easy (A2-B1), Medium (B2), Hard (C1-C2).
- **Multilingual Support**: Definitions and translations in Tamil, Hindi, Telugu, and Malayalam.
- **AI-Powered**: Dynamic word generation and detailed explanations via Google Gemini.
- **Modern UI**: Animated Hangman SVG, glassmorphism design, and smooth transitions.
- **Stateless Architecture**: No database required; game state is managed via client-server communication.
- **Responsive**: Fully optimized for mobile and desktop.

---

## Detailed Project Structure

```text
dicthero/
├── frontend/                       # React SPA (Vite)
│   ├── src/
│   │   ├── animations/             # Framer Motion animation presets
│   │   │   └── motionVariants.js
│   │   ├── components/             # Reusable UI components
│   │   │   ├── GameBoard.jsx       # Hangman SVG + Hint display
│   │   │   ├── Header.jsx          # Navbar with score/streak tracker
│   │   │   ├── Keyboard.jsx        # On-screen letter keyboard
│   │   │   └── ResultCard.jsx      # Post-game definition/translation card
│   │   ├── pages/                  # Main screen components
│   │   │   ├── GameScreen.jsx      # Main game logic and state management
│   │   │   └── SetupScreen.jsx     # Difficulty and Language selection
│   │   ├── services/               # API integration layer
│   │   │   └── api.js              # Axios/Fetch logic for backend calls
│   │   ├── App.jsx                 # Screen routing and global state
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles and design tokens
│   ├── index.html                  # Main HTML entry
│   ├── vite.config.js              # Vite configuration (proxy, plugins)
│   └── package.json                # Frontend dependencies and scripts
│
├── backend/                        # Django REST API
│   ├── config/                     # Core Django configuration
│   │   ├── settings.py             # App config, Gemini key, CORS
│   │   ├── urls.py                 # Main URL routing
│   │   └── wsgi.py                 # Production deployment entry
│   ├── apps/                       # Modular Django apps
│   │   ├── game/                   # Hangman logic & API endpoints
│   │   │   ├── engine.py           # Word masking & guess checking logic
│   │   │   ├── views.py            # API ViewSets (start, guess, end)
│   │   │   └── urls.py             # App-specific routing
│   │   ├── api_integration/        # External AI connectivity
│   │   │   └── client.py           # Google Gemini API & fallback logic
│   │   └── formatter/              # Data shaping
│   │       └── serializers.py      # Response formatters for frontend
│   ├── requirements.txt            # Python dependencies (django, genai, etc.)
│   ├── manage.py                   # Django CLI entry
│   └── .env.example                # Template for environment variables
│
├── dicthero-standalone.html        # Fully portable, single-file HTML version
└── .gitignore                      # Git exclusion rules
```

---

## Setup Instructions

### Prerequisites
- **Node.js 18+**
- **Python 3.11+**
- **Google Gemini API Key** (Get one at [AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create a .env file in the backend directory:
# GEMINI_API_KEY=your_api_key_here
# DJANGO_SECRET_KEY=your_secret_key

# Run Django server
python manage.py runserver 8000
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## API Documentation

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/game/start/`    | Fetch a random word + hints        |
| POST   | `/api/game/guess/`    | Process a letter guess (stateless) |
| POST   | `/api/game/end/`      | Fetch details & translations       |

---

## License

MIT
