from rest_framework import viewsets, filters
from desaparecidos_app.API import serializers
from desaparecidos_app import models

class DesaparecidosViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DesaparecidosSerializer
    queryset = models.Desaparecido.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'bo_numero']
