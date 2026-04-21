from rest_framework import viewsets
from rest_framework.filters import SearchFilter

from .models import Plant
from .serializers import PlantSerializer

class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by('name')
    serializer_class = PlantSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name', 'ailments_treated', 'local_language', 'scientific_name']
