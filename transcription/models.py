from django.db import models
from repository.models import Plant

class Transcription(models.Model):
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, null=True, blank= True)
    audio_file = models.FileField(upload_to='transcriptions/', blank=True, null=True)
    transcribed_text = models.TextField(blank=True)
    language = models.CharField(max_length=100, blank=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Transcription {self.id} - {self.language}"
    
