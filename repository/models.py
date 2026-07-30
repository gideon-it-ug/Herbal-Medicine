from django.db import models
from django.contrib.auth.models import User


class Plant(models.Model):
    """
    Medicinal Plant model representing a documented medicinal plant in the
    African Traditional Herbal Medicine repository.

    Fields align with the proposal's Herbal Knowledge Documentation Module:
    - Plant name, local name, scientific name
    - Disease or health condition treated
    - Method of preparation (decoction, infusion, powder, paste, extract)
    - Recommended dosage
    - Contraindications / side effects
    - Harvesting season
    - Cultural importance
    - Approval status (for knowledge validation workflow)
    - AI classification fields (plant family, body system, treatment category)
    """
    # Core identification
    name = models.CharField(max_length=200, help_text="Common/plant name")
    scientific_name = models.CharField(max_length=200, blank=True, help_text="Scientific/botanical name")
    local_language = models.CharField(max_length=100, blank=True, help_text="Local name in indigenous language")
    geographic_distribution = models.TextField(blank=True, help_text="Where the plant is found")

    # Treatment information
    disease_cured = models.TextField(help_text="Disease or health condition treated")
    preparation_method = models.TextField(help_text="Method of preparation (decoction, infusion, powder, paste, extract)")
    dosage = models.TextField(help_text="Recommended dosage, frequency, and duration")
    side_effects = models.TextField(blank=True, help_text="Possible side effects or contraindications")
    cultural_significance = models.TextField(blank=True, help_text="Traditional significance, cultural practices, beliefs, rituals")
    cultivation_notes = models.TextField(blank=True, help_text="How the plant is grown or harvested")

    # Proposal fields: harvesting season and contraindications
    harvesting_season = models.CharField(
        max_length=200,
        blank=True,
        help_text="The appropriate time for collecting herbal materials for maximum medicinal effectiveness"
    )
    contraindications = models.TextField(
        blank=True,
        help_text="Situations where the herbal remedy should not be administered"
    )

    # Knowledge validation workflow
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default='pending',
        help_text="Approval status for the knowledge validation workflow"
    )
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_plants',
        help_text="User who submitted this plant record"
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_plants',
        help_text="Administrator who approved this record"
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # AI classification fields
    plant_family = models.CharField(
        max_length=100,
        blank=True,
        help_text="Botanical family (e.g., Fabaceae, Asteraceae, Lamiaceae, Rutaceae)"
    )
    body_system = models.CharField(
        max_length=100,
        blank=True,
        help_text="Body system primarily affected (e.g., digestive, respiratory, circulatory)"
    )
    treatment_category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Therapeutic property (e.g., antimalarial, antibacterial, anti-inflammatory)"
    )

    # Multimedia
    image = models.ImageField(upload_to='plants/', blank=True, help_text="Image of the medicinal plant")
    audio_file = models.FileField(upload_to="audio/", blank=True, help_text="Audio recording of traditional knowledge")
    video_file = models.FileField(upload_to='videos/', blank=True, help_text="Video documentation of preparation or use")
    document_file = models.FileField(upload_to='documents/', blank=True, help_text="PDF or document reference")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def is_approved(self):
        return self.approval_status == 'approved'

    @property
    def is_pending(self):
        return self.approval_status == 'pending'

    @property
    def is_rejected(self):
        return self.approval_status == 'rejected'
