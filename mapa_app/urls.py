from django.urls import path
from . import views

urlpatterns = [
    path('', views.mapa_view, name='mapa'),
    path('sobre/', views.sobre_view, name='sobre')
]