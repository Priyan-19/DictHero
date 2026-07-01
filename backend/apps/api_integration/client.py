"""
API Integration Layer
All external API calls go through this module.
Uses Google Gemini as the AI backbone (Free Tier).
"""
import json
import re
import google.generativeai as genai  # Required for Gemini AI
from django.conf import settings

_model = None

def get_model():
    global _model
    if _model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel(settings.GEMINI_MODEL)
    return _model


DIFF_PROMPTS = {
    'easy': (
        'Give a random simple English vocabulary word (A2-B1 level), 4-7 letters. '
        'Ensure the word is different from common examples like "brave" or "happy". '
        'Return ONLY a JSON object: '
        '{"word":"...","hint":"one cryptic clue sentence, no synonyms","category":"...","partOfSpeech":"..."}'
    ),
    'medium': (
        'Give a random B2-level English vocabulary word, 5-9 letters. '
        'Avoid common words; pick something interesting. '
        'Return ONLY a JSON object: '
        '{"word":"...","hint":"cryptic clue 12-15 words","category":"...","partOfSpeech":"..."}'
    ),
    'hard': (
        'Give an advanced, rare C1/C2 English vocabulary word, 7+ letters. '
        'Pick a sophisticated word. '
        'Return ONLY a JSON object: '
        '{"word":"...","hint":"abstract cryptic clue only","category":"...","partOfSpeech":"..."}'
    ),
}

LANG_MAP = {
    'ta': {'label': 'Tamil',     'key': 'tamil',     'script': 'தமிழ்'},
    'hi': {'label': 'Hindi',     'key': 'hindi',     'script': 'हिन्दी'},
    'te': {'label': 'Telugu',    'key': 'telugu',    'script': 'తెలుగు'},
    'ml': {'label': 'Malayalam', 'key': 'malayalam', 'script': 'മലയാളம்'},
}




def _gemini(prompt: str) -> dict:
    """Call Gemini and parse JSON response."""
    import random
    models_to_try = [settings.GEMINI_MODEL, 'gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-flash-latest']
    api_keys_to_try = getattr(settings, 'GEMINI_API_KEYS', [settings.GEMINI_API_KEY])
    
    last_error = None

    keys = list(api_keys_to_try)
    random.shuffle(keys)

    for api_key in keys:
        if not api_key:
            continue
        for model_name in models_to_try:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(model_name)
                
                # Add explicit JSON instruction to the prompt just in case
                full_prompt = prompt + "\nReturn strictly valid JSON. No markdown blocks, no preamble."
                
                response = model.generate_content(full_prompt)
                
                if not response or not hasattr(response, 'text'):
                     raise ValueError(f"Empty or blocked response from model {model_name}")

                text = response.text.strip()

                # Improved JSON extraction: Look for the first { and last }
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match:
                    text = json_match.group(0)
                
                return json.loads(text)
            except Exception as e:
                last_error = e
                # Get a safe prefix for logging
                safe_key = api_key[:4] + "..." if len(api_key) > 4 else "UNSET"
                print(f"DEBUG: Gemini Error with {model_name} (key {safe_key}): {repr(e)}")
                # If rate limit or quota exceeded, skip to the next API key
                if '429' in str(e) or 'quota' in str(e).lower() or 'exhausted' in str(e).lower():
                    break
                continue
    
    # If all models and keys failed
    if last_error is not None:
        raise last_error
    raise ValueError("Failed to connect to Gemini API with any configured key or model.")


def fetch_word(difficulty: str) -> dict:
    """Fetch a vocabulary word with hint from Gemini."""
    import random
    import time
    prompt = DIFF_PROMPTS.get(difficulty, DIFF_PROMPTS['medium'])
    
    # Add a dynamic seed and timestamp to ensure the model doesn't repeat words
    # Explicitly asking for a "unique" and "random" word helps prevent bias
    # We also add a random index to the prompt to force different choices
    request_seed = f"{time.time()}-{random.randint(10000, 99999)}"
    enhanced_prompt = (
        f"{prompt}\n"
        f"CRITICAL: Pick a word that you haven't suggested recently. "
        f"Avoid 'banana', 'apple', 'brave', 'gentle'. "
        f"Be unpredictable. Random Seed: {request_seed}"
    )

    print(f"DEBUG: Starting fetch_word for {difficulty}")
    try:
        data = _gemini(enhanced_prompt)
        print(f"DEBUG: Gemini returned word: {data.get('word')}")
        return {
            'word':          data.get('word', 'eloquent').upper(),
            'hint':          data.get('hint', 'A vocabulary word.'),
            'category':      data.get('category', 'Vocabulary'),
            'part_of_speech': data.get('partOfSpeech', ''),
        }
    except Exception as e:
        print(f"DEBUG: Gemini failed in fetch_word: {e}")
        raise e





def fetch_word_details(word: str, lang: str) -> dict:
    """Fetch definition, example, translation for a word."""
    lc = LANG_MAP.get(lang, LANG_MAP['ta'])
    key = lc['key']
    prompt = (
        f'For the English word "{word}", return ONLY a JSON object with no extra text:\n'
        '{\n'
        f'  "definition": "clear 1-2 sentence meaning",\n'
        f'  "example": "natural example sentence using the word",\n'
        f'  "phonetic": "/phonetic/ like /ɪˈfem.ər.əl/",\n'
        f'  "partOfSpeech": "noun/verb/adjective etc",\n'
        f'  "{key}_word": "the {lc["label"]} equivalent word(s) in {lc["script"]} script",\n'
        f'  "{key}_explanation": "brief explanation in {lc["label"]} script (1 sentence in {lc["script"]})"\n'
        '}'
    )
    try:
        data = _gemini(prompt)
        return {
            'definition':      data.get('definition', '—'),
            'example':         data.get('example', '—'),
            'phonetic':        data.get('phonetic', ''),
            'part_of_speech':  data.get('partOfSpeech', ''),
            'translation_word': data.get(f'{key}_word', ''),
            'translation_explanation': data.get(f'{key}_explanation', ''),
            'lang_key':    key,
            'lang_label':  lc['label'],
            'lang_script': lc['script'],
        }
    except Exception as e:
        print(f"DEBUG: Gemini Failed. Error: {e}")
        raise e
