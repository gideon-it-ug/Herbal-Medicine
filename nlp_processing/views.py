from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
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

    def get_permissions(self):
        if self.action == 'chat':
            return [AllowAny()]
        return [IsAuthenticatedOrReadOnly()]
    
    @action(detail=False, methods=['post'])
    def chat(self, request):
        message = request.data.get('message', '').lower().strip()
    
        from repository.models import Plant
    
    # Handle greetings
        greetings = ['hi', 'hello', 'hey', 'halo', 'hallow', 'good morning', 'good afternoon', 
             'good evening', 'osiibire', 'oli otya', 'how are you', 'sup', 
             'howdy', 'greetings', 'salut', 'jambo', 'habari']
        if any(g in message for g in greetings):
            return Response({'reply': '👋 Osiibire! Welcome to the Herbal Medicine Repository. I can help you find medicinal plants from Bukedi Sub-Region. Try asking me: "what treats malaria?" or "tell me about Kigajji" or "what plants are available?"'})
    
    # Handle what plants are available
        if any(w in message for w in ['what plants', 'all plants', 'available plants', 'list plants']):
            plants = Plant.objects.all()
            if plants:
                names = ', '.join([p.name for p in plants])
                return Response({'reply': f'🌿 We currently have {plants.count()} plant(s) documented: {names}. Ask me about any of them!'})
            return Response({'reply': 'No plants are documented yet. Check back soon!'})
    
    # Handle thank you
        if any(w in message for w in ['thank', 'thanks', 'thank you', 'webale']):
            return Response({'reply': '🙏 You are welcome! Stay healthy and keep exploring our herbal knowledge repository.'})

    # Handle help
        if any(w in message for w in ['help', 'what can you do', 'how do you work']):
            return Response({'reply': '🤖 I can help you:\n• Find plants that treat specific ailments (e.g. "what treats fever?")\n• Tell you about a specific plant (e.g. "tell me about Kigajji")\n• List all available plants\n\nJust ask me anything about herbal medicine!'})

    # Search plants by ailment or name
        plants = Plant.objects.all()
        matched = []
        for plant in plants:
            fields = [
                plant.disease_cured or '',
                plant.name or '',
                plant.preparation_method or '',
                plant.cultural_significance or '',
            ]
            if any(message in field.lower() for field in fields):
                matched.append(plant)

        if matched:
            response = f"🌿 I found {len(matched)} plant(s) that may help:\n\n"
            for plant in matched:
                response += f"• {plant.name}"
                if plant.disease_cured:
                    response += f" — cures {plant.disease_cured}"
                if plant.preparation_method:
                    response += f"\n  Preparation: {plant.preparation_method}"
                if plant.dosage:
                    response += f"\n  Dosage: {plant.dosage}"
                response += "\n\n"
            return Response({'reply': response})
    
        return Response({'reply': "🌿 I am a Herbal Medicine Assistant and I can only help with questions about medicinal plants and ailments from Bukedi Sub-Region. Try asking:\n• 'What treats malaria?'\n• 'Tell me about Kigajji'\n• 'What plants are available?'\n• 'What treats fever?'"})

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
