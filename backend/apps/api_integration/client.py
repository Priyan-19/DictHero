"""
API Integration Layer
All external API calls go through this module.
Uses Google Gemini as the AI backbone (Free Tier).
"""
import json
import re
from google import genai
from django.conf import settings


# Models to try in order — all valid with the new google-genai SDK (v1 API)
MODELS_TO_TRY = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite-preview-06-17',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
]

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
    'ml': {'label': 'Malayalam', 'key': 'malayalam', 'script': 'മലയാളം'},
}


def _gemini(prompt: str) -> dict:
    """Call Gemini using the new google-genai SDK and parse JSON response."""
    import random

    api_keys_to_try = list(getattr(settings, 'GEMINI_API_KEYS', [settings.GEMINI_API_KEY]))
    random.shuffle(api_keys_to_try)

    last_error = None

    full_prompt = prompt + "\nReturn strictly valid JSON. No markdown blocks, no preamble."

    for api_key in api_keys_to_try:
        if not api_key:
            continue
        client = genai.Client(api_key=api_key)
        for model_name in MODELS_TO_TRY:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                )

                if not response or not response.text:
                    raise ValueError(f"Empty or blocked response from model {model_name}")

                text = response.text.strip()

                # Extract JSON object from response
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match:
                    text = json_match.group(0)

                return json.loads(text)

            except Exception as e:
                last_error = e
                safe_key = api_key[:4] + "..." if len(api_key) > 4 else "UNSET"
                print(f"DEBUG: Gemini Error with {model_name} (key {safe_key}): {repr(e)}")
                continue  # Always try the next model

    if last_error is not None:
        raise last_error
    raise ValueError("Failed to connect to Gemini API with any configured key or model.")


def fetch_word(difficulty: str) -> dict:
    """Fetch a vocabulary word with hint from Gemini."""
    import random
    import time
    prompt = DIFF_PROMPTS.get(difficulty, DIFF_PROMPTS['medium'])

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
            'word':           data.get('word', 'eloquent').upper(),
            'hint':           data.get('hint', 'A vocabulary word.'),
            'category':       data.get('category', 'Vocabulary'),
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
            'definition':               data.get('definition', '—'),
            'example':                  data.get('example', '—'),
            'phonetic':                 data.get('phonetic', ''),
            'part_of_speech':           data.get('partOfSpeech', ''),
            'translation_word':         data.get(f'{key}_word', ''),
            'translation_explanation':  data.get(f'{key}_explanation', ''),
            'lang_key':                 key,
            'lang_label':               lc['label'],
            'lang_script':              lc['script'],
        }
    except Exception as e:
        print(f"DEBUG: Gemini Failed. Error: {e}")
        raise e
