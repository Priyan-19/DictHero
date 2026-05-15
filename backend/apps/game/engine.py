"""
Game Engine — stateless Hangman logic.
No database: game state is managed client-side.
"""

DIFF_LIVES = {'easy': 8, 'medium': 6, 'hard': 4}


def mask_word(word: str, guessed: set) -> str:
    """Return masked version of word with guessed letters revealed."""
    return ''.join(
        ch if ch == ' ' or ch.upper() in guessed else '_'
        for ch in word
    )


def check_guess(word: str, letter: str, guessed: set, wrong_count: int, max_wrong: int):
    """
    Process a letter guess.
    Returns dict with updated state.
    """
    letter = letter.upper()
    word_upper = word.upper()

    if letter in guessed:
        return {'error': 'Already guessed', 'duplicate': True}

    new_guessed = guessed | {letter}
    correct = letter in word_upper
    new_wrong = wrong_count if correct else wrong_count + 1
    masked = mask_word(word, new_guessed)
    game_over = new_wrong >= max_wrong or '_' not in masked.replace(' ', '')
    won = '_' not in masked.replace(' ', '') and new_wrong < max_wrong

    return {
        'correct':     correct,
        'letter':      letter,
        'masked_word': masked,
        'wrong_count': new_wrong,
        'guessed':     list(new_guessed),
        'game_over':   game_over,
        'won':         won,
    }


def is_word_complete(word: str, guessed: set) -> bool:
    return all(ch == ' ' or ch.upper() in guessed for ch in word)
