from django.contrib import admin
from .models import Desaparecido

@admin.register(Desaparecido)
class DesaparecidoAdmin(admin.ModelAdmin):
    # Campos a serem exibidos na lista de objetos no painel de administração
    list_display = (
        'nome', 'idade', 'data_desaparecimento', 'ultima_localizacao',
        'bo_numero', 'status', 'data_registro'
    )
    
    # Campos pelos quais se pode pesquisar
    search_fields = ('nome', 'bo_numero', 'ultima_localizacao')
    
    # Filtros laterais para facilitar a navegação
    list_filter = ('status', 'data_desaparecimento', 'idade')
    
    # Adiciona uma hierarquia de data para navegação (ex: por ano, mês, dia)
    date_hierarchy = 'data_desaparecimento'
    
    # Campos que podem ser editados diretamente na lista (cuidado com muitos campos)
    list_editable = ('status',)
