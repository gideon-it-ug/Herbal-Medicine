from django.db import models
class Plant(models.Model):
    name = models.CharField(max_length=200)
    scientific_name= models.CharField(max_length=200, blank=True)
    local_language= models.CharField(max_length=100, blank=True)
    geographic_distribution = models.TextField(blank = True)
    disease_cured = models.TextField()
    preparation_method = models.TextField()
    dosage=models.TextField()
    side_effects = models.TextField(blank=True)
    cultural_significance= models.TextField(blank=True)
    cultivation_notes = models.TextField(blank=True)
    image = models.ImageField(upload_to='plants/', blank=True)
    audio_file = models.FileField(upload_to="audio/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name