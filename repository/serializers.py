from rest_framework import serializers
from .models import Plant


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = '__all__'
        read_only_fields = ('approval_status', 'submitted_by', 'approved_by', 'approved_at', 'created_at', 'updated_at')


class PlantApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ['id', 'name', 'scientific_name', 'local_language', 'disease_cured', 'approval_status', 'submitted_by', 'approved_by', 'approved_at']
        read_only_fields = ('approval_status', 'submitted_by', 'approved_by', 'approved_at')


class PlantFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ['id', 'name', 'scientific_name', 'local_language', 'disease_cured', 'plant_family', 'body_system', 'treatment_category', 'approval_status', 'image']
