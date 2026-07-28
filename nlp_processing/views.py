from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import ExtractedData
from .chatbot_model import get_chatbot
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
        """
        AI-powered chatbot endpoint using a trained TF-IDF + Logistic Regression model.
        The model classifies user messages into intents and returns diverse, role-based
        responses. Supervisor (admin) users receive elevated, context-aware responses.

        Request body:
            - message (str): The user's message
            - is_supervisor (bool, optional): Whether the user is a supervisor/admin

        Response:
            - reply (str): The chatbot's response
            - intent (str): The classified intent
            - confidence (float): Confidence score (0-1)
            - is_supervisor (bool): Whether supervisor responses were used
        """
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'reply': '🌿 Please enter a message so I can help you.'})

        # Determine if the user is a supervisor (admin)
        is_supervisor = request.data.get('is_supervisor', False)
        if not is_supervisor and request.user.is_authenticated:
            # Check if the user has admin role via UserProfile
            try:
                is_supervisor = request.user.profile.is_admin
            except Exception:
                is_supervisor = request.user.is_staff

        try:
            chatbot = get_chatbot()
            result = chatbot.get_response(message, is_supervisor=is_supervisor)
            return Response(result)
        except FileNotFoundError:
            # Fallback to keyword-based responses if model is not trained
            return self._fallback_chat(message, is_supervisor)
        except Exception as e:
            return Response({
                'reply': '🌿 I am experiencing technical difficulties. Please try again later.',
                'intent': 'error',
                'confidence': 0.0,
                'is_supervisor': is_supervisor,
            })

    def _fallback_chat(self, message, is_supervisor):
        """Fallback keyword-based chatbot when the trained model is not available."""
        message_lower = message.lower().strip()

        from repository.models import Plant

        # Handle greetings
        greetings = ['hi', 'hello', 'hey', 'halo', 'hallow', 'good morning', 'good afternoon',
                     'good evening', 'osiibire', 'oli otya', 'how are you', 'sup',
                     'howdy', 'greetings', 'salut', 'jambo', 'habari']
        if any(g in message_lower for g in greetings):
            if is_supervisor:
                return Response({'reply': '👋 Osiibire! Welcome back, supervisor. You can review pending submissions, generate reports, and manage the knowledge base.', 'intent': 'greeting', 'confidence': 0.9, 'is_supervisor': True})
            return Response({'reply': '👋 Osiibire! Welcome to the Herbal Medicine Repository. I can help you find medicinal plants from Bukedi Sub-Region.', 'intent': 'greeting', 'confidence': 0.9, 'is_supervisor': False})

        # Handle list plants
        if any(w in message_lower for w in ['what plants', 'all plants', 'available plants', 'list plants']):
            plants = Plant.objects.all()
            if plants:
                names = ', '.join([p.name for p in plants])
                return Response({'reply': f'🌿 We currently have {plants.count()} plant(s) documented: {names}.', 'intent': 'list_plants', 'confidence': 0.8, 'is_supervisor': is_supervisor})
            return Response({'reply': 'No plants are documented yet. Check back soon!', 'intent': 'list_plants', 'confidence': 0.8, 'is_supervisor': is_supervisor})

        # Handle thank you
        if any(w in message_lower for w in ['thank', 'thanks', 'thank you', 'webale']):
            return Response({'reply': '🙏 You are welcome! Stay healthy and keep exploring our herbal knowledge repository.', 'intent': 'thank_you', 'confidence': 0.8, 'is_supervisor': is_supervisor})

        # Handle help
        if any(w in message_lower for w in ['help', 'what can you do', 'how do you work']):
            return Response({'reply': '🤖 I can help you find plants that treat specific ailments, tell you about medicinal plants, or list all available plants.', 'intent': 'help', 'confidence': 0.8, 'is_supervisor': is_supervisor})

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
            if any(message_lower in field.lower() for field in fields):
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
            return Response({'reply': response, 'intent': 'search_by_ailment', 'confidence': 0.7, 'is_supervisor': is_supervisor})

        return Response({'reply': "🌿 I am a Herbal Medicine Assistant and I can only help with questions about medicinal plants and ailments from Bukedi Sub-Region. Try asking:\n• 'What treats malaria?'\n• 'Tell me about Kigajji'\n• 'What plants are available?'\n• 'What treats fever?'", 'intent': 'no_match', 'confidence': 0.5, 'is_supervisor': is_supervisor})

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
