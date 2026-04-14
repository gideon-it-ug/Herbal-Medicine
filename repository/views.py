from rest_framework import viewsets
from .models import Plant
from .serializers import PlantSerializer
from rest_framework.filters import SearchFilter
filter_backends = [SearchFilter]
search_fields = ['name', 'ailments_treated', 'local_language', 'scientific_name']

class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by('name')
    serializer_class = PlantSerializer