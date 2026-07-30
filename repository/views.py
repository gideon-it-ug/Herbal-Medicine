from collections import Counter
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.db.models import Count, Sum, Avg

from .models import Plant
from .serializers import PlantSerializer, PlantApprovalSerializer, PlantFilterSerializer


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by('name')
    serializer_class = PlantSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'disease_cured', 'local_language', 'scientific_name', 'plant_family', 'body_system', 'treatment_category']
    ordering_fields = ['name', 'created_at', 'approval_status']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter)
        disease_filter = self.request.query_params.get('disease')
        if disease_filter:
            queryset = queryset.filter(disease_cured__icontains=disease_filter)
        family_filter = self.request.query_params.get('family')
        if family_filter:
            queryset = queryset.filter(plant_family__icontains=family_filter)
        body_filter = self.request.query_params.get('body_system')
        if body_filter:
            queryset = queryset.filter(body_system__icontains=body_filter)
        treatment_filter = self.request.query_params.get('treatment_category')
        if treatment_filter:
            queryset = queryset.filter(treatment_category__icontains=treatment_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_plants = Plant.objects.count()
        approved_plants = Plant.objects.filter(approval_status='approved').count()
        pending_plants = Plant.objects.filter(approval_status='pending').count()
        rejected_plants = Plant.objects.filter(approval_status='rejected').count()
        total_practitioners = Plant.objects.values('submitted_by').distinct().count()
        diseases = Plant.objects.values_list('disease_cured', flat=True)
        disease_list = [d.strip() for d in diseases if d.strip()]
        unique_diseases = len(set(disease_list))
        recent_uploads = Plant.objects.order_by('-created_at')[:5]
        recent_uploads_data = PlantFilterSerializer(recent_uploads, many=True).data
        family_counts = Plant.objects.values('plant_family').annotate(count=Count('id')).order_by('-count')[:10]
        body_system_counts = Plant.objects.values('body_system').annotate(count=Count('id')).order_by('-count')[:10]
        treatment_counts = Plant.objects.values('treatment_category').annotate(count=Count('id')).order_by('-count')[:10]
        return Response({
            'total_plants': total_plants,
            'approved_plants': approved_plants,
            'pending_plants': pending_plants,
            'rejected_plants': rejected_plants,
            'total_practitioners': total_practitioners,
            'unique_diseases': unique_diseases,
            'recent_uploads': recent_uploads_data,
            'top_families': list(family_counts),
            'top_body_systems': list(body_system_counts),
            'top_treatment_categories': list(treatment_counts),
        })


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        plants = Plant.objects.filter(approval_status='approved')
        disease_counts = plants.values('disease_cured').annotate(count=Count('id')).order_by('-count')[:20]
        family_counts = plants.values('plant_family').annotate(count=Count('id')).order_by('-count')[:10]
        body_system_counts = plants.values('body_system').annotate(count=Count('id')).order_by('-count')[:10]
        treatment_counts = plants.values('treatment_category').annotate(count=Count('id')).order_by('-count')[:10]
        monthly_counts = plants.values('created_at__month').annotate(count=Count('id')).order_by('created_at__month')
        practitioner_counts = plants.values('submitted_by__username').annotate(count=Count('id')).order_by('-count')[:10]
        return Response({
            'disease_distribution': list(disease_counts),
            'family_distribution': list(family_counts),
            'body_system_distribution': list(body_system_counts),
            'treatment_category_distribution': list(treatment_counts),
            'monthly_submissions': list(monthly_counts),
            'top_contributors': list(practitioner_counts),
            'total_approved': plants.count(),
        })


class ApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending = Plant.objects.filter(approval_status='pending').order_by('created_at')
        serializer = PlantApprovalSerializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def approved(self, request):
        approved = Plant.objects.filter(approval_status='approved').order_by('-approved_at')
        serializer = PlantApprovalSerializer(approved, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def rejected(self, request):
        rejected = Plant.objects.filter(approval_status='rejected').order_by('-created_at')
        serializer = PlantApprovalSerializer(rejected, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        plant = self.get_object()
        plant.approval_status = 'approved'
        plant.approved_by = request.user
        plant.approved_at = timezone.now()
        plant.save()
        return Response({'status': 'approved', 'id': plant.id})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        plant = self.get_object()
        plant.approval_status = 'rejected'
        plant.approved_by = request.user
        plant.approved_at = timezone.now()
        plant.save()
        return Response({'status': 'rejected', 'id': plant.id})


class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile = request.user.profile
        return Response({
            'id': profile.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'role': profile.role,
            'phone_number': profile.phone_number,
            'specialization': profile.specialization,
            'organization': profile.organization,
            'bio': profile.bio,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            'is_approved': profile.is_approved,
            'created_at': profile.created_at,
        })

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        profile = request.user.profile
        profile.phone_number = request.data.get('phone_number', profile.phone_number)
        profile.specialization = request.data.get('specialization', profile.specialization)
        profile.organization = request.data.get('organization', profile.organization)
        profile.bio = request.data.get('bio', profile.bio)
        profile.save()
        return Response({'status': 'updated'})


class ClassificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def classify(self, request):
        text = request.query_params.get('text', '')
        if not text:
            return Response({'error': 'Provide text parameter for classification'}, status=status.HTTP_400_BAD_REQUEST)
        text_lower = text.lower()
        disease_keywords = {
            'malaria': ['malaria', 'fever', 'shivering', 'sweating', 'chills'],
            'cough': ['cough', 'cold', 'flu', 'respiratory'],
            'diabetes': ['diabetes', 'sugar', 'blood sugar', 'glucose'],
            'hypertension': ['hypertension', 'blood pressure', 'high blood'],
            'stomach': ['stomach', 'digestive', 'indigestion', 'bloating', 'constipation'],
            'skin': ['skin', 'rash', 'itch', 'dermatitis', 'wound', 'cut', 'burn'],
            'fever': ['fever', 'temperature', 'hot'],
            'headache': ['headache', 'head pain', 'migraine', 'dizzy'],
            'inflammation': ['inflammation', 'swelling', 'pain', 'ache'],
        }
        body_systems = {
            'digestive': ['stomach', 'digestive', 'belly', 'gut', 'intestine', 'bowel'],
            'respiratory': ['cough', 'cold', 'breath', 'lung', 'chest', 'respiratory'],
            'circulatory': ['blood', 'heart', 'circulation', 'pressure'],
            'nervous': ['headache', 'nervous', 'brain', 'mind', 'sleep', 'anxiety'],
            'reproductive': ['reproductive', 'fertility', 'menstrual', 'pregnancy'],
            'musculoskeletal': ['bone', 'joint', 'muscle', 'back', 'arthritis'],
            'integumentary': ['skin', 'hair', 'nail', 'wound', 'cut', 'burn', 'rash'],
        }
        treatment_categories = {
            'antimalarial': ['malaria', 'fever', 'chills'],
            'antibacterial': ['infection', 'bacteria', 'wound', 'pus'],
            'antiviral': ['virus', 'cold', 'flu', 'cough'],
            'antifungal': ['fungus', 'ringworm', 'yeast', 'itch'],
            'anti-inflammatory': ['inflammation', 'swelling', 'pain', 'ache'],
            'analgesic': ['pain', 'headache', 'ache', 'sore'],
            'wound_healing': ['wound', 'cut', 'burn', 'scar', 'heal'],
            'immune_boosting': ['immune', 'defense', 'protection', 'boost'],
            'nutritional': ['vitamin', 'mineral', 'nutrient', 'supplement'],
        }
        plant_families = {
            'Fabaceae': ['legume', 'bean', 'pea', 'acacia', 'cassia'],
            'Asteraceae': ['daisy', 'sunflower', 'chamomile', 'artemisia', 'aster'],
            'Lamiaceae': ['mint', 'basil', 'oregano', 'thyme', 'sage', 'rosemary'],
            'Rutaceae': ['citrus', 'lemon', 'orange', 'lime', 'grapefruit'],
            'Poaceae': ['grass', 'wheat', 'rice', 'corn', 'barley'],
            'Solanaceae': ['tomato', 'potato', 'pepper', 'eggplant', 'tobacco'],
            'Apiaceae': ['carrot', 'parsley', 'celery', 'cumin', 'fennel'],
        }
        detected_diseases = []
        for disease, keywords in disease_keywords.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_diseases.append(disease)
                    break
        detected_body_systems = []
        for system, keywords in body_systems.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_body_systems.append(system)
                    break
        detected_treatment_categories = []
        for cat, keywords in treatment_categories.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_treatment_categories.append(cat)
                    break
        detected_families = []
        for family, keywords in plant_families.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_families.append(family)
                    break
        return Response({
            'diseases': detected_diseases,
            'body_systems': detected_body_systems,
            'treatment_categories': detected_treatment_categories,
            'plant_families': detected_families,
        })