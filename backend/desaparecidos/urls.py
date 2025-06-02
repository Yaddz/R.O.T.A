from django.urls import path
from . import views

app_name = "desaparecido"


urlpatterns = [
    path("", views.exibir_desaparecidos_view, name="Exibir"),
    path("cadastrar", views.adicionar_desaparecido_view, name="Cadastrar"),
    path("<int:desaparecido_id>/", views.detalhar_desaparecido_view, name="Detalhar"),
    path("<int:desaparecido_id>/editar/", views.editar_desaparecido_view, name="Editar"),
    path("<int:desaparecido_id>/excluir/", views.excluir_desaparecido_view, name="Excluir"),
    path("geojson/", views.desaparecidos_geojson_view, name="GeoJSON"),
    path("<int:desaparecido_id>/json_details/", views.desaparecido_detalhes_json_view, name="JSONDetails"),
    path("ajax/cadastrar/", views.cadastrar_desaparecido_ajax_view, name="AjaxCadastrar"),
    path("ajax/lista_popup_content/", views.lista_desaparecidos_popup_content_view, name="AjaxListaPopupContent"),
    path("<int:desaparecido_id>/ajax_edit_form/", views.editar_desaparecido_ajax_form_view, name="AjaxEditForm"),
    path("relatorios/", views.relatorios_view, name="Relatorios"),
    path("relatorios/exportar_csv/", views.exportar_relatorio_csv_view, name="ExportarRelatorioCSV"),
]
