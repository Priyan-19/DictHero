"""
Game API Views
GET  /api/game/start/   → fetch word + init game
POST /api/game/guess/   → process a letter guess
GET  /api/game/status/  → current game state
POST /api/game/end/     → fetch word details (meaning, translation, example)
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.api_integration.client import fetch_word, fetch_word_details
from apps.game.engine import check_guess, mask_word, DIFF_LIVES
from apps.formatter.serializers import format_start, format_guess, format_details


@api_view(['GET'])
def game_start(request):
    """
    GET /api/game/start/?difficulty=easy&lang=ta
    Fetches a random word from Claude and initialises game state.
    """
    difficulty = request.GET.get('difficulty', 'medium')
    lang       = request.GET.get('lang', 'ta')

    if difficulty not in DIFF_LIVES:
        return Response({'error': 'Invalid difficulty'}, status=status.HTTP_400_BAD_REQUEST)

    word_data  = fetch_word(difficulty)
    max_wrong  = DIFF_LIVES[difficulty]
    masked     = mask_word(word_data['word'], set())

    return Response(format_start(word_data, masked, max_wrong, difficulty, lang))


@api_view(['POST'])
def game_guess(request):
    """
    POST /api/game/guess/
    Body: { word, letter, guessed, wrong_count, difficulty }
    Stateless: client sends full state each time.
    """
    data        = request.data
    word        = data.get('word', '')
    letter      = data.get('letter', '').upper()
    guessed     = set(data.get('guessed', []))
    wrong_count = int(data.get('wrong_count', 0))
    difficulty  = data.get('difficulty', 'medium')
    max_wrong   = DIFF_LIVES.get(difficulty, 6)

    if not letter or len(letter) != 1 or not letter.isalpha():
        return Response({'error': 'Invalid letter'}, status=status.HTTP_400_BAD_REQUEST)
    if not word:
        return Response({'error': 'No word provided'}, status=status.HTTP_400_BAD_REQUEST)

    result = check_guess(word, letter, guessed, wrong_count, max_wrong)

    if result.get('error'):
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    return Response(format_guess(result))


@api_view(['GET'])
def game_status(request):
    """
    GET /api/game/status/?word=...&guessed=A,B,C&wrong_count=2&difficulty=easy
    Returns current masked word and derived state.
    """
    word        = request.GET.get('word', '')
    guessed_raw = request.GET.get('guessed', '')
    wrong_count = int(request.GET.get('wrong_count', 0))
    difficulty  = request.GET.get('difficulty', 'medium')
    max_wrong   = DIFF_LIVES.get(difficulty, 6)

    guessed = set(g.strip().upper() for g in guessed_raw.split(',') if g.strip())
    masked  = mask_word(word, guessed)
    game_over = wrong_count >= max_wrong or '_' not in masked.replace(' ', '')

    return Response({
        'masked_word':    masked,
        'guessed':        list(guessed),
        'wrong_count':    wrong_count,
        'max_wrong':      max_wrong,
        'lives_remaining': max_wrong - wrong_count,
        'game_over':      game_over,
    })


@api_view(['POST'])
def game_end(request):
    """
    POST /api/game/end/
    Body: { word, lang }
    Fetches full word details: definition, translation, example.
    """
    word = request.data.get('word', '')
    lang = request.data.get('lang', 'ta')

    if not word:
        return Response({'error': 'No word provided'}, status=status.HTTP_400_BAD_REQUEST)

    details = fetch_word_details(word, lang)
    return Response(format_details(details))
