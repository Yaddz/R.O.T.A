from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf import settings
from django.contrib.auth import views as auth_views # Importa as views de autenticação do Django
from django.conf.urls.static import static

urlpatterns = [
    path("__reload__/", include("django_browser_reload.urls")),

    path("admin/", admin.site.urls),
    path("login/", auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path("logout/", auth_views.LogoutView.as_view(next_page='/'), name='logout'),
    path("", include("mapa_app.urls")),
    path("desaparecidos/", include("desaparecidos_app.urls"))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
