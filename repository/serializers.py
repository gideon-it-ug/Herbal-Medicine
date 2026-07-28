from rest_framework import serializers
from .models import Plant


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = '__all__'
        read_only_fields = ('approval_status', 'submitted_by', 'approved_by', 'approved_at', 'created_at', 'updated_at')
