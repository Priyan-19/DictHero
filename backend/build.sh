#!/usr/bin/env bash
# ── Render Build Script for Django Backend ─────────────────────
set -o errexit

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📂 Collecting static files..."
python manage.py collectstatic --no-input || echo "⚠️ collectstatic skipped (non-fatal)"

echo "✅ Backend build complete!"
