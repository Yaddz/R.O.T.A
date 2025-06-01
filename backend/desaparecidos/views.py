from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from django.shortcuts import redirect
from .forms import FormularioDesaparecido
from .models import Desaparecido




def exibir_desaparecidos_view(request):
    contexto = {
        'desaparecidos': Desaparecido.objects.all()
    }
    return render(request, 'desaparecido/exibir.html')


def adicionar_desaparecido_view(request):
    if request.method == 'POST':
        formulario = FormularioDesaparecido(request.POST, request.FILES)
        if formulario.is_valid():
            formulario.save()
            return redirect('Exibir') 
    else:
        form = FormularioDesaparecido()

    contexto = {"form": form}
    return render(request, 'desaparecido/adicionar.html', contexto)