"""
Response Formatter
Shapes all API responses into consistent structures.
"""


def format_start(word_data: dict, masked: str, max_wrong: int, difficulty: str, lang: str) -> dict:
    return {
        'word':           word_data['word'],
        'word_length':    len(word_data['word'].replace(' ', '')),
        'masked_word':    masked,
        'hint':           word_data['hint'],
        'category':       word_data['category'],
        'part_of_speech': word_data.get('part_of_speech', ''),
        'max_wrong':      max_wrong,
        'difficulty':     difficulty,
        'lang':           lang,
        'total_letters':  len(word_data['word'].replace(' ', '')),
        'has_spaces':     ' ' in word_data['word'],
        'word_count':     len(word_data['word'].strip().split()),
    }


def format_guess(result: dict) -> dict:
    return {
        'correct':     result['correct'],
        'letter':      result['letter'],
        'masked_word': result['masked_word'],
        'wrong_count': result['wrong_count'],
        'guessed':     result['guessed'],
        'game_over':   result['game_over'],
        'won':         result['won'],
    }


def format_details(details: dict) -> dict:
    return {
        'definition':              details.get('definition', '—'),
        'example':                 details.get('example', '—'),
        'phonetic':                details.get('phonetic', ''),
        'part_of_speech':          details.get('part_of_speech', ''),
        'translation_word':        details.get('translation_word', ''),
        'translation_explanation': details.get('translation_explanation', ''),
        'lang_key':                details.get('lang_key', ''),
        'lang_label':              details.get('lang_label', ''),
        'lang_script':             details.get('lang_script', ''),
    }
