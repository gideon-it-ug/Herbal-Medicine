from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from repository.models import Plant
from transcription.models import Transcription


class NlpApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass12345")
        self.transcription = Transcription.objects.create(
            language="Lugwere",
            transcribed_text=(
                "The plant is called neem. It is used for malaria. "
                "Boil the leaves and take twice daily."
            ),
            is_processed=True,
        )
        Plant.objects.create(
            name="Neem",
            disease_cured="Malaria",
            preparation_method="Boil leaves in water",
            dosage="Twice daily",
        )

    def test_chat_endpoint_returns_reply(self):
        response = self.client.post("/api/nlp/chat/", {"message": "hello"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", response.data)

    def test_process_endpoint_extracts_data(self):
        token_response = self.client.post(
            "/api/token/",
            {"username": "tester", "password": "pass12345"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        response = self.client.post(
            "/api/nlp/process/",
            {"transcription_id": self.transcription.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("plant_name", response.data)
        self.assertIn("ailments", response.data)
