from django.urls import path, include

urlpatterns = [
    path('api/game/', include('apps.game.urls')),
]
