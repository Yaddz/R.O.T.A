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
    path("<int:id>/", views.detalhar_view, name="detalhar"),
    path('remover/<int:id>/', views.remover_view, name='remover'),

    path('relatorio/', views.relatorio_view, name='relatorio'), 

    path('api/', include(route.urls)),
    
    # NOVO: Adicione esta linha para a API de sugestões
    path('api/sugestoes/', views.sugestoes_api_view, name='api-sugestoes'),
]