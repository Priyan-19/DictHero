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

FALLBACK_WORDS = {
    'easy': [
        {'word': 'BRAVE',  'hint': 'The knight showed this when facing the dragon.',    'category': 'Character'},
        {'word': 'GENTLE', 'hint': 'A touch so soft it would not startle a butterfly.', 'category': 'Character'},
        {'word': 'CLEVER', 'hint': 'What foxes in fables always seem to be.',           'category': 'Mind'},
        {'word': 'BRIGHT', 'hint': 'Opposite of dim, or someone very smart.',           'category': 'Adjective'},
        {'word': 'SIMPLE', 'hint': 'Not complex; easy to understand.',                 'category': 'Adjective'},
        {'word': 'DANGER', 'hint': 'Something that could cause harm or injury.',        'category': 'Nouns'},
        {'word': 'FRIEND', 'hint': 'A person you know well and like.',                  'category': 'People'},
        {'word': 'WONDER', 'hint': 'A feeling of surprise and admiration.',             'category': 'Emotion'},
    ],
    'medium': [
        {'word': 'ELOQUENT',  'hint': 'This quality makes speeches powerful and persuasive.', 'category': 'Communication'},
        {'word': 'TENACIOUS', 'hint': 'The quality that keeps a bulldog holding on.',          'category': 'Character'},
        {'word': 'CATALYST',  'hint': 'Something that sparks rapid change without being consumed.', 'category': 'Science'},
        {'word': 'AMBIGUOUS', 'hint': 'When something has more than one possible meaning.',     'category': 'Logic'},
        {'word': 'PRAGMATIC', 'hint': 'Dealing with things sensibly and realistically.',       'category': 'Mindset'},
        {'word': 'RESILIENT', 'hint': 'Able to withstand or recover quickly from difficult conditions.', 'category': 'Character'},
        {'word': 'SOLITUDE',  'hint': 'The state of being alone, usually by choice.',          'category': 'State'},
        {'word': 'VIBRANT',   'hint': 'Full of energy, life, and bright colors.',             'category': 'Adjective'},
    ],
    'hard': [
        {'word': 'EPHEMERAL',     'hint': 'Like morning dew that vanishes before noon.',         'category': 'Academic'},
        {'word': 'MELLIFLUOUS',   'hint': 'Sound that flows like honey poured from a jar.',      'category': 'Arts'},
        {'word': 'PERSPICACIOUS', 'hint': 'What detectives must be to see the unseen truth.',    'category': 'Mind'},
        {'word': 'UBIQUITOUS',    'hint': 'Present, appearing, or found everywhere.',            'category': 'Academic'},
        {'word': 'CACOPHONY',     'hint': 'A harsh, discordant mixture of sounds.',              'category': 'Sounds'},
        {'word': 'SURREPTITIOUS', 'hint': 'Kept secret, especially because it would not be approved of.', 'category': 'Behavior'},
        {'word': 'ENIGMATIC',     'hint': 'Difficult to interpret or understand; mysterious.',    'category': 'Mind'},
        {'word': 'PARADIGM',      'hint': 'A typical example or pattern of something; a model.', 'category': 'Science'},
    ],
}


def _gemini(prompt: str) -> dict:
    """Call Gemini and parse JSON response."""
    models_to_try = [settings.GEMINI_MODEL, 'gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-flash-latest']
    last_error = None

    for model_name in models_to_try:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
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
            print(f"DEBUG: Gemini Error with {model_name}: {repr(e)}")
            continue
    
    # If all models failed
    raise last_error


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
        fb = list(FALLBACK_WORDS.get(difficulty, FALLBACK_WORDS['medium']))
        random.shuffle(fb) 
        pick = fb[0]
        print(f"DEBUG: Falling back to word: {pick['word']}")
        return {'word': pick['word'], 'hint': pick['hint'], 'category': pick['category'], 'part_of_speech': ''}


def _fetch_keyless_details(word: str, lang: str) -> dict:
    """Fallback: Fetch details using Free Dictionary API and deep-translator."""
    import requests
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        # If deep-translator is somehow still missing, return minimal info
        return {
            'definition': 'Definition load error (Dependency missing).',
            'example': '—', 'phonetic': '', 'part_of_speech': '',
            'translation_word': '', 'translation_explanation': '',
            'lang_key': lang, 'lang_label': lang, 'lang_script': ''
        }
    
    lc = LANG_MAP.get(lang, LANG_MAP['ta'])
    key = lc['key']
    
    details = {
        'definition': 'Definition not found.',
        'example': '—',
        'phonetic': '',
        'part_of_speech': '',
        'translation_word': '',
        'translation_explanation': '',
        'lang_key': key, 'lang_label': lc['label'], 'lang_script': lc['script'],
    }
    
    # 1. Dictionary API
    try:
        dict_res = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}", timeout=5)
        if dict_res.ok:
            data = dict_res.json()[0]
            meanings = data.get('meanings', [])
            if meanings:
                details['part_of_speech'] = meanings[0].get('partOfSpeech', '')
                def_obj = meanings[0].get('definitions', [{}])[0]
                details['definition'] = def_obj.get('definition', details['definition'])
                details['example'] = def_obj.get('example', '—')
            details['phonetic'] = data.get('phonetic', '')
    except Exception as e:
        print(f"DEBUG: Keyless Dict Error: {e}")

    # 2. Translation
    try:
        translator = GoogleTranslator(source='en', target=lang)
        details['translation_word'] = translator.translate(word)
        
        # Simple explanation fallback
        expl_text = f"The word '{word}' means {details['definition']}"
        details['translation_explanation'] = translator.translate(expl_text[:150])
    except Exception as e:
        print(f"DEBUG: Keyless Translation Error: {e}")
        
    return details


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
        print(f"DEBUG: Gemini Failed (Quota?), falling back to keyless. Error: {e}")
        return _fetch_keyless_details(word, lang)
