from django.urls import path
from . import views

app_name = "desaparecido"


urlpatterns = [
    path("", views.exibir_desaparecidos_view, name="Exibir"),
    path("cadastrar", views.adicionar_desaparecido_view, name="Cadastrar"),
]
