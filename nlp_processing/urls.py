from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExtractedDataViewSet

router = DefaultRouter()
router.register(r'nlp', ExtractedDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
]