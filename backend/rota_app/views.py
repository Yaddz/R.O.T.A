from django.http import HttpResponse
from django.shortcuts import render
import folium

def mapa_view(request):
    return render(request, 'home/mapa.html',)