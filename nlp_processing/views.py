from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ExtractedData
from transcription.models import Transcription
import re

def extract_plant_data(text):
    text_lower = text.lower()
    
    plant_name = ""
    ailments = ""
    preparation = ""
    dosage = ""

    # Extract plant name
    for keyword in ["called", "known as", "named"]:
        match = re.search(rf"{keyword}\s+(\w+)", text_lower)
        if match:
            plant_name = match.group(1)
            break

    # Extract ailments
    for keyword in ["treat", "cure", "used for", "helps with"]:
        match = re.search(rf"{keyword}\s+([^.]+)", text_lower)
        if match:
            ailments = match.group(1).strip()
            break

    # Extract preparation
    for keyword in ["boil", "grind", "mix", "crush", "prepare"]:
        match = re.search(rf"({keyword}[^.]+)", text_lower)
        if match:
            preparation = match.group(1).strip()
            break

    # Extract dosage
    for keyword in ["take", "dose", "twice", "once", "three times"]:
        match = re.search(rf"({keyword}[^.]+)", text_lower)
        if match:
            dosage = match.group(1).strip()
            break

    return plant_name, ailments, preparation, dosage


class ExtractedDataViewSet(viewsets.ModelViewSet):

    queryset = ExtractedData.objects.all()

    def get_serializer_class(self):
        from .serializers import ExtractedDataSerializer
        return ExtractedDataSerializer
    
    @action(detail=False, methods=['post'])
    def chat(self, request):
        message = request.data.get('message', '').lower()

    
        from repository.models import Plant
        plants = Plant.objects.all()
    
        matched = []
        for plant in plants:
            fields = [
                plant.ailments_treated or '',
                plant.name or '',
                plant.preparation_method or '',
        ]
            if any(message in field.lower() for field in fields):
                matched.append(plant)
    
        if matched:
            response = f"I found {len(matched)} plant(s) that may help:\n\n"
            for plant in matched:
                response += f"🌿 {plant.name} — treats {plant.ailments_treated}. "
                response += f"Preparation: {plant.preparation_method}. "
                response += f"Dosage: {plant.dosage}.\n\n"
        else:
            response = "I couldn't find a plant matching your query. Try searching for a specific ailment like 'malaria' or 'fever'."
    
        return Response({'reply': response})

    @action(detail=False, methods=['post'])
    def process(self, request):
        transcription_id = request.data.get('transcription_id')
        try:
            transcription = Transcription.objects.get(id=transcription_id)
            text = transcription.transcribed_text
            plant_name, ailments, preparation, dosage = extract_plant_data(text)
            extracted = ExtractedData.objects.create(
                transcription=transcription,
                plant_name=plant_name,
                ailments=ailments,
                preparation=preparation,
                dosage=dosage
            )
            return Response({
                'plant_name': plant_name,
                'ailments': ailments,
                'preparation': preparation,
                'dosage': dosage
            })
        except Transcription.DoesNotExist:
            return Response({'error': 'Transcription not found'}, status=404)