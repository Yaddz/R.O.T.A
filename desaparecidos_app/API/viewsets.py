from rest_framework import viewsets
from desaparecidos_app.API import serializers
from desaparecidos_app import models

class DesaparecidosViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DesaparecidosSerializer
    queryset = models.Desaparecido.objects.all()
