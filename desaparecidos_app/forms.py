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

        # Classes comuns para campos de texto, número e data
        text_input_classes = 'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400'
        # Classes para campos de upload de arquivo
        file_input_classes = 'block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer'

        widgets = {
            'nome': forms.TextInput(attrs={'class': text_input_classes}),
            'idade': forms.NumberInput(attrs={'class': text_input_classes}),
            'data_desaparecimento': forms.DateInput(attrs={'type': 'date', 'class': text_input_classes}),
            'descricao': forms.Textarea(attrs={'rows': 4, 'class': text_input_classes}),
            'ultima_localizacao': forms.TextInput(attrs={'class': text_input_classes, 'placeholder': 'Ex: Brasília, Asa Norte, SQN 210'}),
            'latitude': forms.HiddenInput(),
            'longitude': forms.HiddenInput(),
            'bo_numero': forms.TextInput(attrs={'class': text_input_classes}),
            'status': forms.Select(attrs={'class': text_input_classes}),
            'foto_principal': forms.ClearableFileInput(attrs={'class': file_input_classes}),
            'foto_progressao': forms.ClearableFileInput(attrs={'class': file_input_classes}),
        }