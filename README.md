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
- **Animations**: Smooth CSS transitions and state animations
- **Feedback**: Real-time visual feedback on correct/incorrect guesses

### UX Highlights
- Animated Hangman SVG dynamically tracking progress
- Interactive on-screen keyboard with hit/miss visual states
- Post-game ResultCard with detailed definitions and translations
- Fully responsive design optimized for mobile and desktop

---

## 🏗️ System Architecture

The application follows a **modern, stateless, API-driven architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT TOPOLOGY                     │
├──────────────────────┬──────────────────────────────────────┤
│    Vercel (Free)     │         Render (Free)               │
│                      │                                      │
│  ┌────────────────┐  │  ┌────────────────────────────────┐  │
│  │  Vite Static   │──┼──│  Django REST API (gunicorn)   │  │
│  │  Site (SPA)    │  │  │  + WhiteNoise Static Files    │  │
│  └────────────────┘  │  └────────────┬───────────────────┘  │
│                      │               │                      │
│                      │  ┌────────────▼───────────────────┐  │
│                      │  │   Google Gemini AI API         │  │
│                      │  │   (gemini-1.5-flash)           │  │
│                      │  └────────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────────┘
```

### 🐍 Backend: Python & Django
- Django 4.2 with Django REST Framework (DRF)
- Stateless request processing — no database required
- WhiteNoise for static file serving
- Gunicorn WSGI server for production

### ⚡ Frontend: Vanilla JS + Vite
- Pure Vanilla JavaScript SPA (Single Page Application)
- Vite for lightning-fast dev server and optimized production builds
- State managed via client-server communication

### 🔗 AI Layer: Google Gemini
- `gemini-1.5-flash` model for dynamic content generation
- Real-time word fetching, hints, and explanations

---

## 🚀 Key Features

### 🔍 3 Difficulty Levels
- **Easy** → A2-B1 CEFR level words (8 lives)
- **Medium** → B2 CEFR level words (6 lives)
- **Hard** → C1-C2 advanced vocabulary (4 lives)

### 🌍 Multilingual Support
- Definitions and translations available in:
  - Tamil · Hindi · Telugu · Malayalam

### ⚡ Stateless Game Engine
- No database required; game state is strictly managed between client and server

---

## 📂 Project Structure

```text
dicthero/
├── frontend/                       # Vanilla JS SPA (Vite)
│   ├── src/
│   │   ├── index.css               # Complete design system
│   │   └── main.js                 # App logic, state, and rendering
│   ├── index.html                  # Main HTML entry
│   └── vite.config.js              # Vite configuration
│
├── backend/                        # Django REST API
│   ├── config/                     # Core Django configuration
│   │   ├── settings.py             # Settings (env-driven)
│   │   ├── urls.py                 # Root URL routing
│   │   └── wsgi.py                 # WSGI entry point
│   ├── apps/                       # Modular Django apps
│   │   ├── game/                   # Hangman logic & API endpoints
│   │   ├── api_integration/        # Gemini AI connectivity
│   │   └── formatter/              # Data shaping utilities
│   ├── build.sh                    # Render build script
│   ├── Procfile                    # Render process definition
│   ├── runtime.txt                 # Python version pin
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment variable template
│
├── vercel.json                     # Vercel deployment config (frontend)
├── render.yaml                     # Render Blueprint (full-stack IaC)
├── dicthero-standalone.html        # Fully portable, single-file HTML version
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Google Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com/)

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
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and DJANGO_SECRET_KEY

# Run Django server
python manage.py runserver 8000
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev
```

**Access the application at:** `http://localhost:3000`

---

## ☁️ Deployment Guide

### Option A: Vercel (Frontend) + Render (Backend)

> **Recommended** — Best free-tier performance. Vercel serves the frontend via its global CDN, Render hosts the Django API.

#### Step 1: Deploy Backend on Render

1. Push your repo to **GitHub**
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. Set the following environment variables manually in Render dashboard:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://your-app.vercel.app` |

5. Deploy! Your API will be live at `https://dicthero-api.onrender.com`

#### Step 2: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. Import your GitHub repo
3. Configure these settings:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add environment variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://dicthero-api.onrender.com/api` |

> [!IMPORTANT]
> `VITE_API_URL` is baked into the build at compile time. You must redeploy the frontend if you change the backend URL.

5. Deploy! Your frontend will be live at `https://your-app.vercel.app`

---

### Option B: Full-Stack on Render

> Deploy everything on Render using the Blueprint.

1. Push your repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your repo — Render auto-detects `render.yaml` and creates both services
4. Set these environment variables in the dashboard:

**Backend (`dicthero-api`):**

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Your API key |
| `CORS_ALLOWED_ORIGINS` | `https://dicthero.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://dicthero.onrender.com` |

**Frontend (`dicthero`):**

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://dicthero-api.onrender.com/api` |

5. Deploy both services!

---

### Post-Deployment Checklist

- [ ] Backend health check: visit `https://your-backend-url/api/game/start/?difficulty=easy&lang=ta`
- [ ] Frontend loads at your Vercel/Render URL
- [ ] Game starts and Gemini returns words
- [ ] End-game details and translations load correctly
- [ ] CORS errors are absent in browser console

---

## 🔑 AI API Configuration

| Service | Model | Purpose |
|------|------|------|
| Google Gemini | `gemini-1.5-flash` | Word generation, definitions, translations |

### Get Your API Key
Get a free API key at [Google AI Studio](https://aistudio.google.com/)

---

## 📊 API Documentation

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/game/start/`    | Fetch a random word + hints        |
| POST   | `/api/game/guess/`    | Process a letter guess (stateless) |
| POST   | `/api/game/end/`      | Fetch details & translations       |

### Query Parameters

**`GET /api/game/start/`**
| Param | Type | Description |
|---|---|---|
| `difficulty` | `string` | `easy`, `medium`, or `hard` |
| `lang` | `string` | Translation language: `ta`, `hi`, `te`, `ml` |

**`POST /api/game/end/`**
| Field | Type | Description |
|---|---|---|
| `word` | `string` | The target word |
| `lang` | `string` | Translation language code |

---

## 📦 Architecture Highlights

- Fully stateless backend logic — zero database overhead
- AI-driven dynamic content without manual curation
- Component-driven Vanilla JS UI with CSS animations
- Standalone portable HTML version available
- Production-ready with WhiteNoise, Gunicorn, and security headers

---

## 🎯 Use Cases

- Fun and interactive way to build English vocabulary
- Learn meanings in native regional languages
- Challenge yourself with high-level vocabulary (CEFR C1/C2)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, Vite 5, CSS3 |
| Backend | Python 3.11, Django 4.2, DRF |
| AI | Google Gemini (`gemini-1.5-flash`) |
| Frontend Hosting | Vercel (recommended) or Render Static |
| Backend Hosting | Render Web Service |
| Static Files | WhiteNoise |
| WSGI Server | Gunicorn |

---

<div align="center">
  <p>Built with 🎮 for Smarter Vocabulary Learning</p>
  <p>Developed by <strong>Priyan</strong></p>
  <p>© 2026 DictHero. All Rights Reserved.</p>
</div>
