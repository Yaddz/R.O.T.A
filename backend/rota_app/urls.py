from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf import settings # Adicionado
from django.conf.urls.static import static # Adicionado
from django.contrib.auth import views as auth_views # Adicionado para login/logout
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mapa_view, name='mapa_view'), # Adicionado name='mapa_view'
    path('desaparecidos/', include("desaparecidos.urls")),
    # URLs de Autenticação
    path('login/', auth_views.LoginView.as_view(template_name='auth/login.html'), name='login'),
    path('register/', views.register_view, name='register'),
    path('ajax/login/', views.login_popup_process_view, name='ajax_login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='mapa_view'), name='logout'), # Redireciona para a home após logout
]

if settings.DEBUG: # Adicionado para servir arquivos de mídia durante o desenvolvimento
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)