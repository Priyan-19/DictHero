from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-dicthero-dev-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Minimal apps — no database required (fully API-driven)
INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.game',
    'apps.api_integration',
    'apps.formatter',
]

# Minimal middleware — no session/auth/messages (not needed)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {'BACKEND': 'django.template.backends.django.DjangoTemplates',
     'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': [
         'django.template.context_processors.request',
     ]}},
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {}  # No local database — fully API-driven

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS — configure via env for deployment
CORS_URLS_REGEX = r'^/api/.*$'  # Apply CORS to all /api/ routes

cors_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

CORS_ALLOW_ALL_ORIGINS = DEBUG

# CSRF trusted origins for production
csrf_env = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if csrf_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_env.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

# DRF
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES':   ['rest_framework.parsers.JSONParser'],
}

# Gemini
keys_env = os.getenv('GEMINI_API_KEYS', os.getenv('GEMINI_API_KEY', ''))
GEMINI_API_KEYS = [k.strip() for k in keys_env.split(',') if k.strip()]
if not GEMINI_API_KEYS:
    GEMINI_API_KEYS = [''] # Fallback empty string

GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else ''
GEMINI_MODEL   = 'gemini-1.5-flash'
