from django import forms
from .models import Desaparecido, HistoricoLocalizacao # Importe seus modelos
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        # Adicione campos que você deseja no formulário de registro.
        # Exemplo: incluir email, nome e sobrenome.
        fields = UserCreationForm.Meta.fields + ('email', 'first_name', 'last_name',)

class FormularioDesaparecido(forms.ModelForm):
    class Meta:
        model = Desaparecido
        fields = [
            'nome', 'idade', 'data_desaparecimento', 'descricao', 
            'ultima_localizacao', 'latitude', 'longitude', 
            'bo_numero', 'status', 'foto_principal', 'foto_progressao'
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

HistoricoLocalizacaoFormSet = forms.inlineformset_factory(
    Desaparecido, HistoricoLocalizacao,
    fields=('data_avistamento', 'latitude', 'longitude', 'descricao_local'),
    extra=1, can_delete=True,
    widgets={
        'data_avistamento': forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
        'latitude': forms.NumberInput(attrs={'class': 'form-control', 'step': 'any'}),
        'longitude': forms.NumberInput(attrs={'class': 'form-control', 'step': 'any'}),
        'descricao_local': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'}),
    }
)

class RelatorioFiltroForm(forms.Form):
    data_inicio = forms.DateField(
        label='Data de Desaparecimento (Início)',
        required=False,
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
    data_fim = forms.DateField(
        label='Data de Desaparecimento (Fim)',
        required=False,
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
    localizacao = forms.CharField(
        label='Localização (Cidade/Estado/Bairro)',
        required=False,
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: São Paulo'})
    )
    idade_minima = forms.IntegerField(label='Idade Mínima', required=False, min_value=0, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    idade_maxima = forms.IntegerField(label='Idade Máxima', required=False, min_value=0, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    status = forms.ChoiceField(label='Status', required=False, widget=forms.Select(attrs={'class': 'form-control'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Adiciona uma opção 'Todos' e preenche as escolhas de status do modelo
        status_choices = [('', 'Todos')] + list(Desaparecido.STATUS_CHOICES)
        self.fields['status'].choices = status_choices