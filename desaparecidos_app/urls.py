from django.urls import path
from . import views

app_name= "desaparecidos"

urlpatterns = [
    path("", views.exibir_view, name="exibir"),  
    path("adicionar/", views.adicionar_view, name="adicionar"),
    path('editar/<int:id>/', views.editar_view, name='editar'), 
    path("<int:id>/", views.detalhar_view, name="detalhar"), # Adicionado / no final para consistência
    path('remover/<int:id>/', views.remover_view, name='remover'),
]
