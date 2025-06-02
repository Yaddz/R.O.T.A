from django.http import HttpResponse
from django.shortcuts import render, redirect
import folium
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from desaparecidos.forms import CustomUserCreationForm # Ajuste o caminho se o form estiver em outro lugar
from django.contrib import messages
from django.http import JsonResponse


def mapa_view(request):
    return render(request, 'mapa.html',)

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Cadastro realizado com sucesso! Você já está logado.')
            return redirect('mapa_view')
        else:
            messages.error(request, 'Por favor, corrija os erros abaixo.')
    else:
        form = CustomUserCreationForm()
    return render(request, 'auth/register.html', {'form': form})

def login_popup_process_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return JsonResponse({'success': True, 'username': user.username})
        else:
            # Coletar erros de forma simples para JSON
            errors = {field: [e for e in error_list] for field, error_list in form.errors.items()}
            if '__all__' in errors: # Erros não associados a campos específicos
                errors['non_field_errors'] = errors.pop('__all__')
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    return JsonResponse({'success': False, 'errors': 'Invalid request'}, status=400)