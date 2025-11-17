from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Desaparecido
from django.contrib.auth.decorators import login_required # Importa o decorador
from .forms import FormularioDesaparecido
from django.db.models import Count, Q, Case, When, Value, CharField
import json
from django.db.models.functions import TruncMonth
import datetime
from django.http import JsonResponse
from django.db.models import Q


def exibir_view(request):
    # Pega o parâmetro de busca da URL
    query = request.GET.get('q')
    
    if query:
        # Filtra por nome ou número do B.O. (case-insensitive)
        desaparecidos = Desaparecido.objects.filter(
            Q(nome__icontains=query) | Q(bo_numero__icontains=query)
        )
    else:
        desaparecidos = Desaparecido.objects.all()
    contexto = {
        'desaparecidos': desaparecidos,
        'query': query # Envia a query de volta para o template para preencher o campo de busca
    }
    return render(request, 'desaparecido/exibir.html', contexto)


@login_required # Protege a view: exige login para acessar
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

@login_required # Protege a view: exige login para acessar
def editar_view(request, id):
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
    # Esta view não precisa de @login_required se for pública
    desaparecido = get_object_or_404(Desaparecido, pk=id)
    return render(request, 'desaparecido/detalhar.html', {'desaparecido': desaparecido})

@login_required # Protege a view: exige login para acessar
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

def sugestoes_api_view(request):
    """
    Uma view de API leve apenas para sugestões de busca.
    """
    query = request.GET.get('q', '')
    
    # Se a busca for muito curta, não retorna nada
    if len(query) < 2:
        return JsonResponse([], safe=False)
    
    # Busca por nome OU B.O. e limita a 10 resultados para performance
    desaparecidos = Desaparecido.objects.filter(
        Q(nome__icontains=query) | Q(bo_numero__icontains=query)
    ).values('id', 'nome', 'bo_numero')[:10] # Pega apenas os campos necessários
    
    sugestoes = list(desaparecidos)
    return JsonResponse(sugestoes, safe=False)


def relatorio_view(request):
    # --- Lógica de Filtro ---
    data_inicio_str = request.GET.get('data_inicio', '')
    data_fim_str = request.GET.get('data_fim', '')
    
    # NOVO: Ler filtros adicionais
    status_filter = request.GET.get('status', '')
    localizacao_filter = request.GET.get('localizacao', '')
    idade_min_str = request.GET.get('idade_min', '')
    idade_max_str = request.GET.get('idade_max', '')

    # Filtro de Data (Existente)
    data_inicio = None
    if data_inicio_str:
        try:
            data_inicio = datetime.datetime.strptime(data_inicio_str, '%Y-%m-%d').date()
        except ValueError:
            pass 

    data_fim = None
    if data_fim_str:
        try:
            data_fim = datetime.datetime.strptime(data_fim_str, '%Y-%m-%d').date()
        except ValueError:
            pass 

    # Cria a base de query
    base_queryset = Desaparecido.objects.all()

    # Aplica filtros de data
    if data_inicio:
        base_queryset = base_queryset.filter(data_registro__gte=data_inicio)
    if data_fim:
        base_queryset = base_queryset.filter(data_registro__lte=data_fim)

    # NOVO: Aplica filtros adicionais
    if status_filter:
        base_queryset = base_queryset.filter(status=status_filter)
    if localizacao_filter:
        base_queryset = base_queryset.filter(ultima_localizacao__icontains=localizacao_filter)
    
    # Filtro de Idade (com try/except para garantir que são números)
    try:
        if idade_min_str:
            base_queryset = base_queryset.filter(idade__gte=int(idade_min_str))
    except (ValueError, TypeError):
        pass # Ignora valor inválido
    
    try:
        if idade_max_str:
            base_queryset = base_queryset.filter(idade__lte=int(idade_max_str))
    except (ValueError, TypeError):
        pass # Ignora valor inválido
    
    # --- Fim da Lógica de Filtro ---


    # 1. Relatório por Status (Agora usa o base_queryset filtrado)
    status_counts = base_queryset.values('status').annotate(total=Count('status')).order_by('-total')
    status_map = dict(Desaparecido.STATUS_CHOICES)
    status_reports = [
        {'status': status_map.get(item['status'], item['status'].replace("_", " ").title()), 'total': item['total']}
        for item in status_counts
    ]

    # 2. Relatório por Faixa Etária (Agora usa o base_queryset filtrado)
    age_groups = base_queryset.aggregate(
        criancas=Count('id', filter=Q(idade__gte=0, idade__lte=12)),
        adolescentes=Count('id', filter=Q(idade__gte=13, idade__lte=17)),
        jovens_adultos=Count('id', filter=Q(idade__gte=18, idade__lte=29)),
        adultos=Count('id', filter=Q(idade__gte=30, idade__lte=59)),
        idosos=Count('id', filter=Q(idade__gte=60)),
        nao_informada=Count('id', filter=Q(idade__isnull=True)),
    )
    age_reports_data = {
        "labels": ["Crianças (0-12)", "Adolescentes (13-17)", "Jovens Adultos (18-29)", "Adultos (30-59)", "Idosos (60+)", "Idade não informada"],
        "data": [
            age_groups['criancas'], age_groups['adolescentes'], age_groups['jovens_adultos'],
            age_groups['adultos'], age_groups['idosos'], age_groups['nao_informada'],
        ]
    }

    # 3. Casos Registrados por Mês (Agora usa o base_queryset filtrado)
    if not data_inicio and not data_fim:
        today = datetime.date.today()
        data_inicio_mes = today - datetime.timedelta(days=365)
        casos_mes_query = base_queryset.filter(data_registro__gte=data_inicio_mes)
    else:
        casos_mes_query = base_queryset
    
    casos_por_mes = casos_mes_query \
        .annotate(mes=TruncMonth('data_registro')) \
        .values('mes') \
        .annotate(total=Count('id')) \
        .order_by('mes')

    meses_labels = [item['mes'].strftime("%b/%Y") for item in casos_por_mes]
    meses_data = [item['total'] for item in casos_por_mes]
    casos_mes_data = {
        "labels": meses_labels,
        "data": meses_data
    }

    # 4. Top 10 Localizações (Agora usa o base_queryset filtrado)
    top_locais = base_queryset \
        .exclude(ultima_localizacao__exact='') \
        .values('ultima_localizacao') \
        .annotate(total=Count('id')) \
        .order_by('-total')[:10]

    locais_labels = [item['ultima_localizacao'] for item in top_locais]
    locais_data = [item['total'] for item in top_locais]
    top_locais_data = {
        "labels": locais_labels,
        "data": locais_data
    }

    contexto = {
        'status_reports': status_reports,
        'age_reports_json': json.dumps(age_reports_data),
        'casos_mes_json': json.dumps(casos_mes_data),
        'top_locais_json': json.dumps(top_locais_data),
        
        # Passa os valores dos filtros de volta para o template
        'data_inicio': data_inicio_str,
        'data_fim': data_fim_str,
        'status_choices': Desaparecido.STATUS_CHOICES, # Envia as opções de Status
        'status_filter': status_filter,
        'localizacao_filter': localizacao_filter,
        'idade_min_filter': idade_min_str,
        'idade_max_filter': idade_max_str,
    }
    return render(request, 'desaparecido/relatorios.html', contexto)