from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extended user profile that adds role-based access control (RBAC).
    Each user is assigned a specific role that determines their permissions
    and access to system resources.

    Roles:
        - administrator: Full system control (manage users, approve submissions, reports)
        - traditional_health_practitioner: Document herbal knowledge, upload media
        - researcher: Search, view, and analyze approved herbal knowledge
        - community_member: Limited access to search and view approved information
    """
    ROLE_CHOICES = [
        ('administrator', 'Administrator'),
        ('traditional_health_practitioner', 'Traditional Health Practitioner'),
        ('researcher', 'Researcher'),
        ('community_member', 'Community Member'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='community_member',
        help_text="User's role determines their access level and permissions."
    )
    phone_number = models.CharField(max_length=20, blank=True)
    specialization = models.CharField(max_length=200, blank=True, help_text="For practitioners: area of expertise")
    organization = models.CharField(max_length=200, blank=True, help_text="Institution or community")
    bio = models.TextField(blank=True, help_text="Brief biography or description")
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_approved = models.BooleanField(default=True, help_text="Whether the user account is approved for use")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == 'administrator'

    @property
    def is_practitioner(self):
        return self.role == 'traditional_health_practitioner'

    @property
    def is_researcher(self):
        return self.role == 'researcher'

    @property
    def is_community_member(self):
        return self.role == 'community_member'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a UserProfile when a new User is created."""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when the User is saved."""
    instance.profile.save()
