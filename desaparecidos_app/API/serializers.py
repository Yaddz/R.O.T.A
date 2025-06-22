from rest_framework import serializers
from desaparecidos_app import models

class DesaparecidosSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = models.Desaparecido
        # É uma boa prática listar os campos explicitamente.
        fields = [
            'id', 'nome', 'idade', 'data_desaparecimento', 'descricao',
            'ultima_localizacao', 'latitude', 'longitude', 'bo_numero',
            'data_registro', 'status', 'foto_principal', 'foto_progressao',
            'status_display'
            # Adicione outros campos do modelo se necessário
        ]
