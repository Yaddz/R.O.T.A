from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.contrib import messages # Adicionado para feedback ao usuário
from django.shortcuts import redirect, get_object_or_404
from .forms import FormularioDesaparecido, HistoricoLocalizacaoFormSet, CustomUserCreationForm, RelatorioFiltroForm
from django.contrib.auth.decorators import login_required, user_passes_test # Adicionado
from .models import Desaparecido
import random # Adicionado para dados aleatórios
from django.urls import reverse # Para gerar URLs
from django.db.models import Count, Q
from django.utils import timezone
import csv # Para exportação CSV


# Função para verificar se o usuário é staff (administrador)
def is_staff_user(user):
    return user.is_staff


def exibir_desaparecidos_view(request):
    contexto = {
        'desaparecidos': Desaparecido.objects.all()
    }
    return render(request, 'desaparecido/exibir.html', contexto)


@login_required # Opcional: exigir login para adicionar, descomente se necessário
def adicionar_desaparecido_view(request): # Adicionado decorador
    if request.method == 'POST':
        form = FormularioDesaparecido(request.POST, request.FILES)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Desaparecido cadastrado com sucesso!')
            except Exception as e:
                messages.error(request, f'Ocorreu um erro ao salvar: {e}')
                # Opcional: logar o erro 'e' para depuração mais detalhada no servidor
            return redirect("desaparecido:Exibir") 
        else:
            messages.error(request, 'Por favor, corrija os erros abaixo. Verifique os campos destacados.')
    else:
        form = FormularioDesaparecido()

    contexto = {"form": form}
    return render(request, 'desaparecido/adicionar.html', contexto)


def detalhar_desaparecido_view(request, desaparecido_id):
    desaparecido = get_object_or_404(Desaparecido, pk=desaparecido_id)
    contexto = {
        'desaparecido': desaparecido
    }
    return render(request, 'desaparecido/detalhar.html', contexto)

@login_required
@user_passes_test(is_staff_user, login_url='login') # Redireciona para login se não for staff
def editar_desaparecido_view(request, desaparecido_id):
    desaparecido = get_object_or_404(Desaparecido, pk=desaparecido_id)
    
    if request.method == 'POST':
        form = FormularioDesaparecido(request.POST, request.FILES, instance=desaparecido)
        formset = HistoricoLocalizacaoFormSet(request.POST, request.FILES, instance=desaparecido, prefix='historico')
        if form.is_valid() and formset.is_valid():
            try:
                form.save()
                formset.save() # Salva os itens do histórico
                messages.success(request, f'Cadastro de "{desaparecido.nome}" atualizado com sucesso!')
                return redirect('desaparecido:Detalhar', desaparecido_id=desaparecido.id)
            except Exception as e:
                messages.error(request, f'Ocorreu um erro ao atualizar: {e}')
        else:
            messages.error(request, 'Por favor, corrija os erros abaixo.')
    else:
        form = FormularioDesaparecido(instance=desaparecido)
        formset = HistoricoLocalizacaoFormSet(instance=desaparecido, prefix='historico')

    contexto = {
        'form': form,
        'formset': formset, # Adiciona o formset ao contexto
        'desaparecido': desaparecido,
    }
    return render(request, 'desaparecido/editar.html', contexto)

@login_required
@user_passes_test(is_staff_user, login_url='login')
def excluir_desaparecido_view(request, desaparecido_id):
    desaparecido = get_object_or_404(Desaparecido, pk=desaparecido_id)
    if request.method == 'POST':
        try:
            nome_excluido = desaparecido.nome
            desaparecido.delete()
            messages.success(request, f'Cadastro de "{nome_excluido}" excluído com sucesso!')
            return redirect('desaparecido:Exibir')
        except Exception as e:
            messages.error(request, f'Ocorreu um erro ao excluir: {e}')
            return redirect('desaparecido:Detalhar', desaparecido_id=desaparecido.id)
    
    contexto = {'desaparecido': desaparecido}
    return render(request, 'desaparecido/confirmar_exclusao.html', contexto)

def gerar_dados_aleatorios_para_mapa(request, num_pontos_por_cidade=30): # request não é usado aqui, pode remover
    """Gera dados GeoJSON aleatórios para teste do mapa."""
    features = []
    cidades_base = [
        {"nome_cidade": "São Paulo", "lat": -23.5505, "lon": -46.6333},
        {"nome_cidade": "Rio de Janeiro", "lat": -22.9068, "lon": -43.1729},
        {"nome_cidade": "Brasília", "lat": -15.793889, "lon": -47.882778},
        {"nome_cidade": "Salvador", "lat": -12.9714, "lon": -38.5014},
        {"nome_cidade": "Fortaleza", "lat": -3.7319, "lon": -38.5267},
    ]

    placeholder_foto_url = "https://via.placeholder.com/100x100.png?text=Foto"
    count = 1

    for cidade in cidades_base:
        for i in range(num_pontos_por_cidade):
            # Gera um pequeno desvio aleatório para agrupar os pontos
            offset_lat = (random.random() - 0.5) * 0.5 # Desvio de até ~0.25 graus
            offset_lon = (random.random() - 0.5) * 0.5 # Desvio de até ~0.25 graus
            
            lat = cidade["lat"] + offset_lat
            lon = cidade["lon"] + offset_lon
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "id": count, # ID fictício para teste
                    "nome": f"Pessoa Aleatória {count} ({cidade['nome_cidade']})",
                    "idade": random.randint(5, 80),
                    "foto_url": placeholder_foto_url if random.choice([True, False]) else None,
                    # "detalhes_url": "#" # Não mais necessário se o popup for no mapa
                }
            })
            count += 1
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

def desaparecidos_geojson_view(request):
    """
    Retorna os dados dos desaparecidos com localização como uma FeatureCollection GeoJSON.
    Alterne entre dados reais e dados de teste descomentando/comentando as seções.
    """
    # --- Para usar dados de TESTE (descomente a linha abaixo e comente o bloco de dados reais) ---
    # geojson_data = gerar_dados_aleatorios_para_mapa(request, num_pontos_por_cidade=25)
    # --- Fim dos dados de TESTE ---
    
    # --- Para usar dados REAIS do banco (comente a linha acima e descomente este bloco) ---
    # desaparecidos_com_localizacao = Desaparecido.objects.filter(
    #     latitude__isnull=False,
    #     longitude__isnull=False
    # )
    # features = []
    # for desaparecido in desaparecidos_com_localizacao:
    #     features.append({
    #         "type": "Feature",
    #         "geometry": {"type": "Point", "coordinates": [float(desaparecido.longitude), float(desaparecido.latitude)]},
    #         "properties": {
    #             "nome": desaparecido.nome,
    #             "id": desaparecido.id, # Adicionado ID para buscar detalhes
    #             "idade": desaparecido.idade if desaparecido.idade is not None else "Não informada",
    #             "foto_url": desaparecido.foto_principal.url if desaparecido.foto_principal else None,
    #             # "detalhes_url": request.build_absolute_uri(reverse('desaparecido:Detalhar', args=[desaparecido.id])) # Não mais necessário se o popup for no mapa
    #         }
    #     })
    # geojson_data = {"type": "FeatureCollection", "features": features}
    # --- Fim dos dados REAIS ---

    # Usando dados reais por padrão agora
    desaparecidos_com_localizacao = Desaparecido.objects.filter(
        latitude__isnull=False,
        longitude__isnull=False
    )
    features = []
    for desaparecido in desaparecidos_com_localizacao:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [float(desaparecido.longitude), float(desaparecido.latitude)]},
            "properties": {
                "nome": desaparecido.nome,
                "id": desaparecido.id, # Adicionado ID para buscar detalhes
                "idade": desaparecido.idade if desaparecido.idade is not None else "Não informada",
                "foto_url": desaparecido.foto_principal.url if desaparecido.foto_principal else None,
                "data_desaparecimento": desaparecido.data_desaparecimento.strftime("%d/%m/%Y") if desaparecido.data_desaparecimento else "Não informada",
            }
        })
    geojson_data = {"type": "FeatureCollection", "features": features}
    return JsonResponse(geojson_data)

def desaparecido_detalhes_json_view(request, desaparecido_id):
    desaparecido = get_object_or_404(Desaparecido, pk=desaparecido_id)
    historico_localizacoes = desaparecido.historico_localizacoes.all().order_by('data_avistamento')
    timeline_data = [
        {
            "latitude": float(item.latitude),
            "longitude": float(item.longitude),
            "data_avistamento": item.data_avistamento.strftime("%d/%m/%Y %H:%M"),
            "descricao_local": item.descricao_local or "Local não descrito",
        }
        for item in historico_localizacoes
    ]

    data = {
        "nome": desaparecido.nome,
        "idade": desaparecido.idade if desaparecido.idade is not None else "Não informada",
        "foto_principal_url": desaparecido.foto_principal.url if desaparecido.foto_principal else None,
        "descricao": desaparecido.descricao or "Nenhuma descrição fornecida.",
        "ultima_localizacao": desaparecido.ultima_localizacao or "Não informada.",
        "data_desaparecimento": desaparecido.data_desaparecimento.strftime("%d/%m/%Y") if desaparecido.data_desaparecimento else "Não informada",
        "timeline": timeline_data,
        "user_is_staff": request.user.is_staff,
        "edit_url": request.build_absolute_uri(reverse('desaparecido:Editar', args=[desaparecido.id])) if request.user.is_staff else None
    }
    return JsonResponse(data)

@login_required
@user_passes_test(is_staff_user, login_url='login')
def cadastrar_desaparecido_ajax_view(request):
    if request.method == 'POST':
        form = FormularioDesaparecido(request.POST, request.FILES)
        if form.is_valid():
            try:
                desaparecido = form.save()
                # Retornar dados básicos do desaparecido para adicionar ao mapa, se desejar
                # ou apenas uma mensagem de sucesso.
                return JsonResponse({'success': True, 'message': 'Desaparecido cadastrado com sucesso!', 'desaparecido_id': desaparecido.id, 'nome': desaparecido.nome})
            except Exception as e:
                return JsonResponse({'success': False, 'errors': {'__all__': [f'Erro ao salvar: {e}']}}, status=500)
        else:
            errors = {field: [e for e in error_list] for field, error_list in form.errors.items()}
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    return JsonResponse({'success': False, 'errors': 'Método GET não permitido para esta URL.'}, status=405)

def lista_desaparecidos_popup_content_view(request):
    desaparecidos = Desaparecido.objects.all().order_by('-data_registro') # Ou outra ordenação
    # A barra de pesquisa será frontend, mas poderia ser backend aqui também
    # Você precisará criar este template: 'desaparecido/_tabela_desaparecidos.html'
    return render(request, 'desaparecido/_tabela_desaparecidos.html', {'desaparecidos': desaparecidos})

@login_required
@user_passes_test(is_staff_user, login_url='login')
def editar_desaparecido_ajax_form_view(request, desaparecido_id):
    desaparecido = get_object_or_404(Desaparecido, pk=desaparecido_id)
    form = FormularioDesaparecido(instance=desaparecido)
    formset = HistoricoLocalizacaoFormSet(instance=desaparecido, prefix='historico') # Align prefix with editar_desaparecido_view
    
    # Você precisará criar este template: 'desaparecido/_form_editar_popup.html'
    return render(request, 'desaparecido/_form_editar_popup.html', {'form': form, 'formset': formset, 'desaparecido': desaparecido})

@login_required # Ou user_passes_test se for restrito a staff
def relatorios_view(request):
    form = RelatorioFiltroForm(request.GET or None)
    queryset = Desaparecido.objects.all()

    if form.is_valid():
        cd = form.cleaned_data
        if cd.get('data_inicio'):
            queryset = queryset.filter(data_desaparecimento__gte=cd['data_inicio'])
        if cd.get('data_fim'):
            queryset = queryset.filter(data_desaparecimento__lte=cd['data_fim'])
        if cd.get('localizacao'):
            queryset = queryset.filter(ultima_localizacao__icontains=cd['localizacao'])
        if cd.get('idade_minima') is not None:
            queryset = queryset.filter(idade__gte=cd['idade_minima'])
        if cd.get('idade_maxima') is not None:
            queryset = queryset.filter(idade__lte=cd['idade_maxima'])
        if cd.get('status'):
            queryset = queryset.filter(status=cd['status'])

    # Agregação para gráficos
    status_data = queryset.values('status').annotate(total=Count('status')).order_by('status')
    # Converte displaynames para o gráfico
    status_labels = [dict(Desaparecido.STATUS_CHOICES).get(item['status'], item['status']) for item in status_data]
    status_counts = [item['total'] for item in status_data]

    # Exemplo: Desaparecidos por ano
    # Para gráficos mais complexos (ex: por mês/ano), pode ser necessário mais processamento
    # ou usar bibliotecas como django-pandas.
    # Aqui um exemplo simples por ano de desaparecimento:
    anos_data = queryset.filter(data_desaparecimento__isnull=False)\
                        .extra(select={'year': "EXTRACT(year FROM data_desaparecimento)"})\
                        .values('year')\
                        .annotate(total=Count('id'))\
                        .order_by('year')
    anos_labels = [item['year'] for item in anos_data]
    anos_counts = [item['total'] for item in anos_data]


    context = {
        'form': form,
        'desaparecidos': queryset,
        'status_labels': status_labels,
        'status_counts': status_counts,
        'anos_labels': anos_labels,
        'anos_counts': anos_counts,
    }
    return render(request, 'desaparecido/relatorios.html', context)


@login_required # Ou user_passes_test
def exportar_relatorio_csv_view(request):
    form = RelatorioFiltroForm(request.GET or None) # Usa os mesmos filtros GET
    queryset = Desaparecido.objects.all()

    if form.is_valid(): # Valida e aplica filtros
        cd = form.cleaned_data
        if cd.get('data_inicio'):
            queryset = queryset.filter(data_desaparecimento__gte=cd['data_inicio'])
        if cd.get('data_fim'):
            queryset = queryset.filter(data_desaparecimento__lte=cd['data_fim'])
        if cd.get('localizacao'):
            queryset = queryset.filter(ultima_localizacao__icontains=cd['localizacao'])
        if cd.get('idade_minima') is not None:
            queryset = queryset.filter(idade__gte=cd['idade_minima'])
        if cd.get('idade_maxima') is not None:
            queryset = queryset.filter(idade__lte=cd['idade_maxima'])
        if cd.get('status'):
            queryset = queryset.filter(status=cd['status'])

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="relatorio_desaparecidos_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Nome', 'Idade', 'Data de Desaparecimento', 'Última Localização', 
        'Latitude', 'Longitude', 'Status', 'Descrição', 'BO', 'Data de Registro'
    ])

    for desaparecido in queryset:
        writer.writerow([
            desaparecido.id,
            desaparecido.nome,
            desaparecido.idade,
            desaparecido.data_desaparecimento.strftime("%Y-%m-%d") if desaparecido.data_desaparecimento else '',
            desaparecido.ultima_localizacao,
            desaparecido.latitude,
            desaparecido.longitude,
            desaparecido.get_status_display(), # Usa o display name do status
            desaparecido.descricao,
            desaparecido.bo_numero,
            desaparecido.data_registro.strftime("%Y-%m-%d %H:%M:%S") if desaparecido.data_registro else ''
        ])
    return response