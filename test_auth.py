from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationApiTests(APITestCase):
    def test_register_creates_user(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "newresearcher",
                "password": "securepass123",
                "email": "researcher@example.com",
                "first_name": "Gideon",
                "last_name": "Mugabe",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newresearcher").exists())

    def test_register_rejects_short_password(self):
        response = self.client.post(
            "/api/register/",
            {"username": "baduser", "password": "short"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="baduser").exists())

    def test_registered_user_can_login(self):
        self.client.post(
            "/api/register/",
            {"username": "loginuser", "password": "securepass123"},
            format="json",
        )
        login_response = self.client.post(
            "/api/token/",
            {"username": "loginuser", "password": "securepass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
