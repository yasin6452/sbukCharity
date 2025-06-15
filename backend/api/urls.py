from django.urls import path, include
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'benefactors', views.BenefactorPersonViewSet)
router.register(r'health-assists', views.HealthAssistPersonViewSet)
router.register(r'doctors', views.DoctorViewSet)
router.register(r'private-companies', views.PrivateCompanyViewSet)
router.register(r'patient-service-requests', views.PatientServiceRequestViewSet)
router.register(r'service-centers', views.ServiceCenterViewSet)
router.register(r'medical-centers', views.MedicalCenterViewSet)
router.register(r'charity-centers', views.CharityCenterViewSet)
router.register(r'government-organizations', views.GovernmentOrganizationViewSet)
router.register(r'associations', views.AssociationViewSet)
router.register(r'consultation-requests', views.ConsultationRequestViewSet)

urlpatterns = [
    path('sign-in/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('hello/', views.HelloView.as_view(), name='hello'),

    path('patients/by-national-code/<str:national_code>/', views.PatientByNationalCodeAPIView.as_view(), name='get-patient-by-national-code'),
    path('', include(router.urls)),
]