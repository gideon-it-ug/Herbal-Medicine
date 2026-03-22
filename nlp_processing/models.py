from django.db import models
from transcription.models import Transcription

class ExtractedData(models.Model):
    transcription = models.ForeignKey(Transcription, on_delete=models.CASCADE)
    plant_name = models.CharField(max_length=200, blank=True)
    ailments = models.TextField(blank=True)
    preparation = models.TextField(blank=True)
    dosage = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Extracted: {self.plant_name}"