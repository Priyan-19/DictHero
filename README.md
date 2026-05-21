<div align="center">

# 🎮 DictHero
### Gamified English Vocabulary Builder ⚡🔤

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Django_4.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

**DictHero** is a production-level, fully API-driven Hangman SPA for vocabulary learning with bilingual support. Built with Vanilla JavaScript, Vite, and Django, it leverages Google Gemini to deliver a dynamic, gamified learning experience.

</div>

---

## 📖 Project Overview

This platform transforms the process of learning English vocabulary by combining engaging gameplay, intelligent AI generation, and multilingual support.

### Core Value Proposition
- **🎮 Gamified Learning**: Engaging Hangman gameplay
- **🧠 AI-Powered**: Dynamic word generation & detailed explanations
- **🌍 Multilingual**: Native translations & hints (Tamil, Hindi, Telugu, Malayalam)
- **⚡ Stateless Architecture**: Fully API-driven without DB overhead
- **🎨 Modern UI**: Glassmorphism design and smooth animations

---

## 🎨 Design Philosophy: Gamified UI/UX

The interface is crafted to provide a highly interactive and engaging learning environment.

### Visual System
- **Design Style**: Glassmorphism and sleek modern UI
- **Animations**: Framer Motion for smooth state transitions
- **Feedback**: Real-time visual feedback on correct/incorrect guesses

### UX Highlights
- Animated Hangman SVG dynamically tracking progress
- Interactive on-screen keyboard
- Post-game ResultCard with detailed definitions and translations
- Fully responsive design optimized for mobile and desktop

---

## 🏗️ System Architecture

The application follows a **modern, stateless, API-driven architecture**:

### 🐹 Backend: Python & Django
- Django 4.2 with Django REST Framework (DRF)
- Stateless request processing
- Modular app structure for game logic and AI integration

### ⚡ Frontend: React + Vite
- React 18 SPA (Single Page Application)
- Framer Motion for UI animations
- State managed via client-server communication

### 🔗 AI Layer: Google Gemini
- `gemini-1.5-flash` model for dynamic content generation
- Real-time word fetching, hints, and explanations

---

## 🚀 Key Features

### 🔍 3 Difficulty Levels
- **Easy** → A2-B1 CEFR level words
- **Medium** → B2 CEFR level words
- **Hard** → C1-C2 advanced vocabulary

### 🌍 Multilingual Support
- Definitions and translations available in:
  - Tamil
  - Hindi
  - Telugu
  - Malayalam

### ⚡ Stateless Game Engine
- No database required; game state is strictly managed between client and server

---

## 📂 Project Structure

```text
dicthero/
├── frontend/                       # React SPA (Vite)
│   ├── src/
│   │   ├── animations/             # Framer Motion presets
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Main screen components
│   │   ├── services/               # API integration layer
│   │   └── App.jsx                 # Screen routing
│   ├── index.html                  # Main HTML entry
│   └── vite.config.js              # Vite configuration
│
├── backend/                        # Django REST API
│   ├── config/                     # Core Django configuration
│   ├── apps/                       # Modular Django apps
│   │   ├── game/                   # Hangman logic & API endpoints
│   │   ├── api_integration/        # External AI connectivity
│   │   └── formatter/              # Data shaping
│   ├── requirements.txt            # Python dependencies
│   └── manage.py                   # Django CLI entry
│
└── dicthero-standalone.html        # Fully portable, single-file HTML version
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Gemini API Key

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

**Access the application at:** `http://localhost:3000` (or Vite's default port)

---

## 🔑 AI API Configuration

| Service | Model | Purpose |
|------|------|------|
| Google Gemini | `gemini-1.5-flash` | Word generation, definitions, translations |

### Recommendation
Get a free API key at [Google AI Studio](https://aistudio.google.com/)

---

## 📊 API Documentation

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/game/start/`    | Fetch a random word + hints        |
| POST   | `/api/game/guess/`    | Process a letter guess (stateless) |
| POST   | `/api/game/end/`      | Fetch details & translations       |

---

## 📦 Architecture Highlights

- Fully stateless backend logic
- AI-driven dynamic content without manual DB curation
- Component-driven React UI with Framer Motion
- Standalone portable HTML version available

---

## 🎯 Use Cases

- Fun and interactive way to build English vocabulary
- Learn meanings in native regional languages
- Challenge yourself with high-level vocabulary

---

<div align="center">
  <p>Built with 🎮 for Smarter Vocabulary Learning</p>
  <p>Developed by <strong>Priyan</strong></p>
  <p>© 2026 DictHero. All Rights Reserved.</p>
</div>
