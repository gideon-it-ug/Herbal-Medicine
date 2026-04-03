from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Transcription
from rest_framework.permissions import IsAuthenticatedOrReadOnly

permission_classes = [IsAuthenticatedOrReadOnly]

class TranscriptionViewSet(viewsets.ModelViewSet):
    queryset = Transcription.objects.all()

    def get_serializer_class(self):
        from .serializers import TranscriptionSerializer
        return TranscriptionSerializer

    @action(detail=True, methods=['post'])
    def transcribe(self, request, pk=None):
        transcription = self.get_object()
        
        if transcription.is_processed:
            return Response({'message': 'Already transcribed'})
        
        import whisper
        model = whisper.load_model("base")
        audio_path = transcription.audio_file.path
        result = model.transcribe(audio_path)
        
        transcription.transcribed_text = result["text"]
        transcription.is_processed = True
        transcription.save()
        
        return Response({'transcribed_text': result["text"]})