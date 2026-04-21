from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Transcription


class TranscriptionApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass12345")

    def test_create_transcription_requires_authentication(self):
        response = self.client.post("/api/transcriptions/", {"language": "Lugwere"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_transcription_with_token(self):
        token_response = self.client.post(
            "/api/token/",
            {"username": "tester", "password": "pass12345"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        response = self.client.post("/api/transcriptions/", {"language": "Lugwere"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transcription.objects.count(), 1)


class EndToEndApiFlowTests(APITestCase):
    def setUp(self):
        User.objects.create_user(username="e2euser", password="pass12345")

    def test_login_upload_nlp_save_search_and_chat(self):
        login_response = self.client.post(
            "/api/token/",
            {"username": "e2euser", "password": "pass12345"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        upload_response = self.client.post(
            "/api/transcriptions/",
            {
                "language": "Lugwere",
                # Simulates the output of a completed transcribe step.
                "transcribed_text": (
                    "The plant is called neem. It is used for malaria. "
                    "Boil leaves and take twice daily."
                ),
                "is_processed": True,
            },
            format="json",
        )
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        transcription_id = upload_response.data["id"]

        nlp_response = self.client.post(
            "/api/nlp/process/",
            {"transcription_id": transcription_id},
            format="json",
        )
        self.assertEqual(nlp_response.status_code, status.HTTP_200_OK)

        save_response = self.client.post(
            "/api/plants/",
            {
                "name": nlp_response.data["plant_name"] or "Neem",
                "ailments_treated": nlp_response.data["ailments"] or "Malaria",
                "preparation_method": nlp_response.data["preparation"] or "Boil leaves",
                "dosage": nlp_response.data["dosage"] or "Twice daily",
                "local_language": "Lugwere",
            },
            format="json",
        )
        self.assertEqual(save_response.status_code, status.HTTP_201_CREATED)

        search_response = self.client.get("/api/plants/?search=malaria")
        self.assertEqual(search_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(search_response.data), 1)

        self.client.credentials()
        chat_response = self.client.post(
            "/api/nlp/chat/",
            {"message": "what treats malaria"},
            format="json",
        )
        self.assertEqual(chat_response.status_code, status.HTTP_200_OK)
        self.assertIn("reply", chat_response.data)
