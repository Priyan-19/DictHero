<div align="center">

# 🧠 DictHero
### Gamified Vocabulary Learning Platform 🎯📚

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django_4.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-ff1709?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**DictHero** is a production-grade, AI-powered vocabulary learning platform that transforms language acquisition into an engaging, gamified experience. Built as a fully stateless SPA, it leverages modern web technologies and generative AI to deliver dynamic word challenges with multilingual support.

</div>

---

## 📖 Project Overview

DictHero reimagines vocabulary building through an interactive Hangman-style game enhanced by AI-generated content and real-time feedback.

### Core Value Proposition
- **🎮 Gamified Learning**: Interactive gameplay improves retention
- **🤖 AI-Powered Content**: Dynamic word generation via Google Gemini
- **🌐 Multilingual Support**: Native translations in regional languages
- **⚡ Stateless Architecture**: No database, ultra-lightweight backend
- **📱 Responsive Design**: Seamless across mobile and desktop

---

## 🏗️ System Architecture

DictHero follows a **fully API-driven stateless architecture**:

### ⚛️ Frontend: React + Vite
- Component-based SPA
- Framer Motion for animations
- Responsive UI with modern design tokens

### 🐍 Backend: Django REST API
- Stateless request-response model
- Game logic handled via API endpoints
- Modular app structure

### 🤖 AI Engine: Google Gemini
- Word generation based on difficulty levels
- Contextual definitions and explanations
- Multilingual translation support

---

## 🚀 Key Features

### 🎮 Gamified Learning Engine
- Classic Hangman gameplay reimagined
- Real-time letter guessing system
- Score and streak tracking

### 📊 Difficulty Levels
- **Easy** → A2–B1 vocabulary
- **Medium** → B2 vocabulary
- **Hard** → C1–C2 vocabulary

### 🌐 Multilingual Support
- Translations available in:
  - Tamil
  - Hindi
  - Telugu
  - Malayalam

### 🤖 AI-Powered Intelligence
- Dynamic word selection
- Context-aware definitions
- Detailed explanations for learning reinforcement

### 🎨 Modern UI/UX
- Glassmorphism design system
- Animated Hangman SVG
- Smooth transitions via Framer Motion

### ⚡ Stateless Architecture
- No database required
- Lightweight backend
- Scalable and deployment-friendly

---

## 📂 Project Structure

```text
dicthero/
├── frontend/
│   ├── src/
│   │   ├── animations/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── game/
│   │   ├── api_integration/
│   │   └── formatter/
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
├── dicthero-standalone.html
└── .gitignore
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
venv\Scripts\activate
# source venv/bin/activate (Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Configure environment
# .env file:
# GEMINI_API_KEY=your_api_key
# DJANGO_SECRET_KEY=your_secret

# Run server
python manage.py runserver 8000
```

---

### 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

### 3. Access Application

```
http://localhost:3000
```

---

## 🔌 API Documentation

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/game/start/` | Fetch random word + hints |
| POST | `/api/game/guess/` | Process letter guess |
| POST | `/api/game/end/` | Fetch word details & translations |

---

## 🔒 Architecture Highlights

- Fully stateless → no persistence layer
- AI-driven content → no static datasets
- Modular backend apps for scalability
- Clean separation of UI, logic, and AI layers

---

## 📦 Tech Stack Summary

| Layer | Technology |
|------|-----------|
| Frontend | React 18, Vite, Framer Motion |
| Backend | Django 4.2, DRF |
| AI Engine | Google Gemini (gemini-1.5-flash) |
| Architecture | Stateless API-driven |

---

## 🎯 Use Cases

- Vocabulary building for students
- Competitive exam preparation
- Language learning with regional support
- Gamified ed-tech applications

---

## 📄 License

MIT License

---

<div align="center">
  <p>Built with 🧠 for Smarter Learning</p>
  <p>Developed by <strong>Priyan</strong></p>
  <p>© 2026 DictHero Platform. All Rights Reserved.</p>
</div>