from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet, DashboardViewSet, ReportsViewSet, ApprovalViewSet, UserProfileViewSet, ClassificationViewSet

router = DefaultRouter()
router.register(r'plants', PlantViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardViewSet.as_view({'get': 'stats'}), name='dashboard-stats'),
    path('reports/summary/', ReportsViewSet.as_view({'get': 'summary'}), name='reports-summary'),
    path('approval/pending/', ApprovalViewSet.as_view({'get': 'pending'}), name='approval-pending'),
    path('approval/approved/', ApprovalViewSet.as_view({'get': 'approved'}), name='approval-approved'),
    path('approval/rejected/', ApprovalViewSet.as_view({'get': 'rejected'}), name='approval-rejected'),
    path('approval/<int:pk>/approve/', ApprovalViewSet.as_view({'post': 'approve'}), name='approve-plant'),
    path('approval/<int:pk>/reject/', ApprovalViewSet.as_view({'post': 'reject'}), name='reject-plant'),
    path('profile/me/', UserProfileViewSet.as_view({'get': 'me'}), name='profile-me'),
    path('profile/update/', UserProfileViewSet.as_view({'put': 'update_profile'}), name='profile-update'),
    path('classify/', ClassificationViewSet.as_view({'get': 'classify'}), name='classify'),
]