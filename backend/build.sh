#!/usr/bin/env bash
# ── Render Build Script for Django Backend ─────────────────────
# This script is used by Render to build the backend service.
# It installs dependencies and collects static files.

set -o errexit  # Exit on error

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "📂 Collecting static files..."
python manage.py collectstatic --no-input

echo "✅ Backend build complete!"
