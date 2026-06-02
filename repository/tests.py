from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Plant


class PlantApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass12345")
        self.plant = Plant.objects.create(
            name="Neem",
            scientific_name="Azadirachta indica",
            local_language="Lugwere",
            disease_cured="Malaria, fever",
            preparation_method="Boil leaves in water",
            dosage="Take twice daily",
        )

    def test_plants_list_is_public(self):
        response = self.client.get("/api/plants/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_plants_search_filters_results(self):
        response = self.client.get("/api/plants/?search=malaria")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Neem")

    def test_create_plant_requires_authentication(self):
        payload = {
            "name": "Moringa",
            "disease_cured": "Anemia",
            "preparation_method": "Boil leaves",
            "dosage": "Once daily",
        }
        response = self.client.post("/api/plants/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_plant_with_jwt_succeeds(self):
        token_response = self.client.post(
            "/api/token/", {"username": "tester", "password": "pass12345"}, format="json"
        )
        access_token = token_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        payload = {
            "name": "Moringa",
            "disease_cured": "Anemia",
            "preparation_method": "Boil leaves",
            "dosage": "Once daily",
            "local_language": "Lugwere",
        }
        response = self.client.post("/api/plants/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Plant.objects.filter(name="Moringa").count(), 1)
