from django.db import models

# Create your models here.

class Desaparecido(models.Model):
    STATUS_CHOICES = [
        ('desaparecido', 'Desaparecido'),
        ('encontrado', 'Encontrado'),
        ('em_investigacao', 'Em Investigação'),
    ]

    nome = models.CharField(max_length=255, help_text="Nome completo da pessoa desaparecida.")
    idade = models.PositiveIntegerField(null=True, blank=True, help_text="Idade da pessoa no momento do desaparecimento.")
    data_desaparecimento = models.DateField(null=True, blank=True, help_text="Data em que a pessoa desapareceu.")
    descricao = models.TextField(blank=True, help_text="Descrição física, roupas que usava, e outras características relevantes.")
    ultima_localizacao = models.CharField(max_length=255, blank=True, help_text="Último local conhecido onde a pessoa foi vista.")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True,)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True,)
    bo_numero = models.CharField(max_length=50, blank=True, null=True, unique=True, help_text="Número do Boletim de Ocorrência, se houver.")
    data_registro = models.DateField(auto_now_add=True, help_text="Data de registro do caso.")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='desaparecido',
        help_text="Status atual do caso."
    )

    foto_principal = models.ImageField(upload_to='fotos_desaparecidos/', null=True, blank=True, help_text="Foto principal da pessoa desaparecida.")
    foto_progressao = models.ImageField(upload_to='fotos_progressao/', null=True, blank=True, help_text="Foto de progressão de idade, se aplicável.")

    def __str__(self):
        return self.nome

class HistoricoLocalizacao(models.Model):
    desaparecido = models.ForeignKey(Desaparecido, related_name='historico_localizacoes', on_delete=models.CASCADE)
    data_avistamento = models.DateTimeField(help_text="Data e hora em que a pessoa foi vista ou a localização foi registrada.")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    descricao_local = models.TextField(blank=True, null=True, help_text="Descrição do local ou circunstância do avistamento/registro.")
    data_registro_historico = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_avistamento'] # Mais recente primeiro por padrão na listagem do admin, mas podemos reordenar na query.

    def __str__(self):
        return f"Avistamento de {self.desaparecido.nome} em {self.data_avistamento.strftime('%d/%m/%Y %H:%M')}"