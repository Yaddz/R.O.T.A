from django.urls import path, include
from . import views
from desaparecidos_app.API import viewsets as DesaparecidosViewset

from rest_framework import routers

route = routers.DefaultRouter()

route.register(r'desaparecidos', DesaparecidosViewset.DesaparecidosViewSet, basename='desaparecidos')


app_name= "desaparecidos"

urlpatterns = [
    path("", views.exibir_view, name="exibir"),  
    path("adicionar/", views.adicionar_view, name="adicionar"),
    path('editar/<int:id>/', views.editar_view, name='editar'), 
    path("<int:id>/", views.detalhar_view, name="detalhar"), # Adicionado / no final para consistência
    path('remover/<int:id>/', views.remover_view, name='remover'),

    path('relatorio/', views.relatorio_view, name='relatorio'), # Adicionada barra final para consistência

    path('api/', include(route.urls)) # Adiciona o prefixo 'api/' às URLs do router
]
