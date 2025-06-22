from django.shortcuts import render

def mapa_view(request):
    return render(request, 'mapa/home.html')

def sobre_view(request):
    return render(request, 'mapa/sobre.html')


