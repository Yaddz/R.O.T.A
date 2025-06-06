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

        widgets = {
            'data_desaparecimento': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'descricao': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'idade': forms.NumberInput(attrs={'class': 'form-control'}),
            'ultima_localizacao': forms.TextInput(attrs={'class': 'form-control'}),
            'latitude': forms.NumberInput(attrs={'class': 'form-control', 'step': 'any'}),
            'longitude': forms.NumberInput(attrs={'class': 'form-control', 'step': 'any'}),
            'bo_numero': forms.TextInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'foto_principal': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
            'foto_progressao': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
        }