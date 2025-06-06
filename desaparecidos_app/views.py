from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Desaparecido
from .forms import FormularioDesaparecido


def exibir_view(request):
    desaparecidos = Desaparecido.objects.all()
    contexto = {
        'desaparecidos':desaparecidos
    }
    return render(request, 'desaparecido/exibir.html', contexto)


def adicionar_view(request):
    if request.method == 'POST':
        formulario = FormularioDesaparecido(request.POST, request.FILES)
        if formulario.is_valid():
            formulario.save()
            return redirect('desaparecidos:exibir')
    else:
        formulario = FormularioDesaparecido()

    contexto  = {
        'formulario': formulario
    }
	
    return render(request, 'desaparecido/adicionar.html', contexto)

def editar_view(request, id): # Adicione o parâmetro 'id' aqui
    desaparecido = get_object_or_404(Desaparecido, pk=id)
    if request.method == 'POST':
        form = FormularioDesaparecido(request.POST, request.FILES, instance=desaparecido)
        if form.is_valid():
            form.save()
            # Redirecionar para a página de detalhes ou lista após salvar
            return redirect('desaparecidos:detalhar', id=desaparecido.id) 
    else:
        form = FormularioDesaparecido(instance=desaparecido)
    
    return render(request, 'desaparecido/editar.html', {'form': form, 'desaparecido': desaparecido})

def detalhar_view(request, id):
    desaparecido = get_object_or_404(Desaparecido, pk=id)
    return render(request, 'desaparecido/detalhar.html', {'desaparecido': desaparecido})

def remover_view(request, id):
    desaparecido = get_object_or_404(Desaparecido, pk=id)
    # Assegura que a remoção só ocorra via POST
    if request.method == 'POST':
        nome_removido = desaparecido.nome 
        desaparecido.delete()
        messages.success(request, f'O cadastro de "{nome_removido}" foi removido com sucesso.')
        # Redireciona para a lista após a remoção
        return redirect('desaparecidos:exibir')
    # Se o acesso for via GET, ou qualquer outro método, redireciona para a página de detalhes.
    # Isso previne a remoção acidental ao acessar a URL diretamente.
    return redirect('desaparecidos:detalhar', id=id)
