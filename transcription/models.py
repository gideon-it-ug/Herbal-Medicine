from django.db import models
from repository.models import Plant

class Transcription(models.Model):
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, null=True, blank= True)
    audio_file = models.FileField(upload_to='transcriptions/')
    transcribed_text = models.TextField(blank=True)
    language = models.BooleanField(default=False)
    is_processed = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transcription {self.id} - {self.language}"
    