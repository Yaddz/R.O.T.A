from django.contrib import admin
from django.urls import path
from django.urls import include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mapa_view),
    path('desaparecidos/', include("desaparecidos.urls")),
]