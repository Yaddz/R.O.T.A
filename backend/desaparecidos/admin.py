from django.contrib import admin
from .models import Desaparecido, HistoricoLocalizacao

class HistoricoLocalizacaoInline(admin.TabularInline): # Ou admin.StackedInline para um layout diferente
    model = HistoricoLocalizacao
    extra = 1 # Número de formulários em branco para adicionar
    fields = ('data_avistamento', 'latitude', 'longitude', 'descricao_local')
    ordering = ('-data_avistamento',) # Opcional: ordem dentro do inline

@admin.register(Desaparecido)
class DesaparecidoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'idade', 'status', 'data_desaparecimento', 'data_registro')
    list_filter = ('status', 'data_registro')
    search_fields = ('nome', 'descricao', 'ultima_localizacao', 'bo_numero')
    inlines = [HistoricoLocalizacaoInline]

@admin.register(HistoricoLocalizacao)
class HistoricoLocalizacaoAdmin(admin.ModelAdmin):
    list_display = ('desaparecido', 'data_avistamento', 'descricao_local', 'latitude', 'longitude')
    list_filter = ('data_avistamento',)
    search_fields = ('desaparecido__nome', 'descricao_local')