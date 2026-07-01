from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Transcription
from .serializers import TranscriptionSerializer

_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        _whisper_model = whisper.load_model("base")
    return _whisper_model


class TranscriptionViewSet(viewsets.ModelViewSet):
    queryset = Transcription.objects.all()
    serializer_class = TranscriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def transcribe(self, request, pk=None):
        transcription = self.get_object()

        if not transcription.audio_file:
            return Response(
                {'message': 'No audio file uploaded for this transcription.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if transcription.is_processed:
            return Response(
                {'message': 'Already transcribed'},
                status=status.HTTP_409_CONFLICT,
            )

        model = get_whisper_model()
        audio_path = transcription.audio_file.path
        result = model.transcribe(audio_path)

        transcription.transcribed_text = result["text"]
        transcription.is_processed = True
        transcription.processed_at = timezone.now()
        transcription.save()

        return Response({'transcribed_text': result["text"]})
