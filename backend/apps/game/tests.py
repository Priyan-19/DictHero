"""
Tests for Game API endpoints.
Run with: python manage.py test apps.game
"""
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


MOCK_WORD_DATA = {
    'word': 'ELOQUENT',
    'hint': 'This quality makes speeches powerful.',
    'category': 'Communication',
    'part_of_speech': 'adjective',
}

MOCK_DETAILS = {
    'definition': 'Fluent and persuasive in speaking or writing.',
    'example': 'She gave an eloquent speech.',
    'phonetic': '/ˈel.ə.kwənt/',
    'part_of_speech': 'adjective',
    'translation_word': 'சொல்வன்மை',
    'translation_explanation': 'சொல்வன்மை உள்ளவர்',
    'lang_key': 'tamil',
    'lang_label': 'Tamil',
    'lang_script': 'தமிழ்',
}


class GameStartViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('apps.game.views.fetch_word', return_value=MOCK_WORD_DATA)
    def test_start_easy(self, mock_fetch):
        response = self.client.get('/api/game/start/?difficulty=easy&lang=ta')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('masked_word', data)
        self.assertIn('hint', data)
        self.assertEqual(data['max_wrong'], 8)
        self.assertEqual(data['difficulty'], 'easy')

    @patch('apps.game.views.fetch_word', return_value=MOCK_WORD_DATA)
    def test_start_medium(self, mock_fetch):
        response = self.client.get('/api/game/start/?difficulty=medium&lang=hi')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['max_wrong'], 6)

    @patch('apps.game.views.fetch_word', return_value=MOCK_WORD_DATA)
    def test_start_hard(self, mock_fetch):
        response = self.client.get('/api/game/start/?difficulty=hard&lang=te')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['max_wrong'], 4)

    def test_start_invalid_difficulty(self):
        response = self.client.get('/api/game/start/?difficulty=extreme')
        self.assertEqual(response.status_code, 400)


class GameGuessViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_correct_guess(self):
        payload = {'word': 'BRAVE', 'letter': 'B', 'guessed': [], 'wrong_count': 0, 'difficulty': 'easy'}
        response = self.client.post('/api/game/guess/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['correct'])
        self.assertEqual(data['wrong_count'], 0)

    def test_wrong_guess(self):
        payload = {'word': 'BRAVE', 'letter': 'Z', 'guessed': [], 'wrong_count': 0, 'difficulty': 'easy'}
        response = self.client.post('/api/game/guess/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data['correct'])
        self.assertEqual(data['wrong_count'], 1)

    def test_invalid_letter(self):
        payload = {'word': 'BRAVE', 'letter': '1', 'guessed': [], 'wrong_count': 0, 'difficulty': 'easy'}
        response = self.client.post('/api/game/guess/', payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_game_over_on_max_wrong(self):
        payload = {'word': 'BRAVE', 'letter': 'Z', 'guessed': ['X', 'Q', 'J'], 'wrong_count': 3, 'difficulty': 'hard'}
        response = self.client.post('/api/game/guess/', payload, format='json')
        data = response.json()
        self.assertTrue(data['game_over'])

    def test_win_condition(self):
        # All letters guessed except E
        payload = {'word': 'BRAVE', 'letter': 'E', 'guessed': ['B', 'R', 'A', 'V'], 'wrong_count': 0, 'difficulty': 'medium'}
        response = self.client.post('/api/game/guess/', payload, format='json')
        data = response.json()
        self.assertTrue(data['won'])
        self.assertTrue(data['game_over'])


class GameStatusViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_status(self):
        response = self.client.get('/api/game/status/?word=BRAVE&guessed=B,R&wrong_count=1&difficulty=medium')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('masked_word', data)
        self.assertIn('lives_remaining', data)
        self.assertEqual(data['wrong_count'], 1)


class GameEndViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('apps.game.views.fetch_word_details', return_value=MOCK_DETAILS)
    def test_end_game(self, mock_details):
        response = self.client.post('/api/game/end/', {'word': 'ELOQUENT', 'lang': 'ta'}, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('definition', data)
        self.assertIn('translation_word', data)
        self.assertIn('example', data)

    def test_end_game_no_word(self):
        response = self.client.post('/api/game/end/', {'lang': 'ta'}, format='json')
        self.assertEqual(response.status_code, 400)


class GameEngineTest(TestCase):
    def test_mask_word(self):
        from apps.game.engine import mask_word
        self.assertEqual(mask_word('BRAVE', set()), '_____')
        self.assertEqual(mask_word('BRAVE', {'B', 'R'}), 'BR___')
        self.assertEqual(mask_word('BRAVE', {'B', 'R', 'A', 'V', 'E'}), 'BRAVE')

    def test_mask_with_spaces(self):
        from apps.game.engine import mask_word
        self.assertEqual(mask_word('GO BOLD', {'G', 'O'}), 'GO ____')

    def test_check_guess_correct(self):
        from apps.game.engine import check_guess
        result = check_guess('BRAVE', 'B', set(), 0, 6)
        self.assertTrue(result['correct'])
        self.assertIn('B', result['guessed'])

    def test_check_guess_wrong(self):
        from apps.game.engine import check_guess
        result = check_guess('BRAVE', 'Z', set(), 0, 6)
        self.assertFalse(result['correct'])
        self.assertEqual(result['wrong_count'], 1)
