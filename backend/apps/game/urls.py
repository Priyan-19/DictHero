from django.urls import path
from . import views

urlpatterns = [
    path('start/',  views.game_start, name='game-start'),
    path('guess/',  views.game_guess, name='game-guess'),
    path('status/', views.game_status, name='game-status'),
    path('end/',    views.game_end,   name='game-end'),
]
