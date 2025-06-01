from django import forms
from . models import Desaparecido



class FormularioDesaparecido(forms.ModelForm):
    class Meta:
        model = Desaparecido
        fields = [
            'nome',
            'idade',
            'data_desaparecimento',
            'descricao',
            'ultima_localizacao',
            'latitude',
            'longitude',
            'bo_numero',
            'status',
            'foto_principal',
            'foto_progressao',
        ]
