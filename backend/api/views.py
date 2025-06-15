from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *


class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {"message": "سلام! شما با موفقیت وارد شده‌اید!"}
        return Response(content)


User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "page_size": self.page_size,
                "results": data,
            }
        )


class PatientViewSet(viewsets.ModelViewSet):
    queryset = patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        # اضافه کردن logging برای بررسی داده‌های ورودی
        print("Received data:", request.data)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # چاپ خطاها برای اشکال‌زدایی بهتر
            print("Validation errors:", serializer.errors)
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "بیمار با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            # گزارش خطا
            print(f"Error in create: {str(e)}")
            return Response(
                {"ok": False, "message": f"خطا در ثبت بیمار: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات بیمار با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "بیمار با موفقیت حذف شد"}, status=status.HTTP_200_OK
        )


# افزودن به views.py


class BenefactorPersonViewSet(viewsets.ModelViewSet):
    queryset = benefactorPerson.objects.all()
    serializer_class = BenefactorPersonSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "فرد خیر با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت فرد خیر: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات فرد خیر با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "فرد خیر با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class HealthAssistPersonViewSet(viewsets.ModelViewSet):
    queryset = healthAssistPerson.objects.all()
    serializer_class = HealthAssistPersonSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "شخص سلامت‌یار با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت شخص سلامت‌یار: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات شخص سلامت‌یار با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "شخص سلامت‌یار با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "پزشک با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت پزشک: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات پزشک با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "پزشک با موفقیت حذف شد"}, status=status.HTTP_200_OK
        )


# افزودن به views.py


class PrivateCompanyViewSet(viewsets.ModelViewSet):
    queryset = privateCompany.objects.all()
    serializer_class = PrivateCompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "شرکت خصوصی با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت شرکت خصوصی: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات شرکت خصوصی با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "شرکت خصوصی با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


# views.py - اضافه به فایل موجود


# دریافت بیمار با کد ملی
class PatientByNationalCodeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, national_code):
        try:
            user = customUser.objects.get(national_code=national_code)
            patient_obj = patient.objects.get(national_code=user)
            serializer = PatientSerializer(patient_obj)
            return Response({"ok": True, "data": serializer.data})
        except customUser.DoesNotExist:
            return Response(
                {"ok": False, "message": "کاربر با این کد ملی یافت نشد"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except patient.DoesNotExist:
            return Response(
                {"ok": False, "message": "این کد ملی متعلق به بیمار نیست"},
                status=status.HTTP_404_NOT_FOUND,
            )


# ویوست درخواست سرویس بیمار
class PatientServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = patientServicRequest.objects.all().order_by("-created_at")
    serializer_class = PatientServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "درخواست سرویس با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت درخواست سرویس: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "درخواست سرویس با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "درخواست سرویس با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class ServiceCenterViewSet(viewsets.ModelViewSet):
    queryset = ServiceCenter.objects.all().order_by("-created_at")
    serializer_class = ServiceCenterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["name", "serviceCategory", "city", "state"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = serializer.save()
        return Response(
            {
                "ok": True,
                "data": self.get_serializer(instance).data,
                "message": "مرکز خدمات با موفقیت ثبت شد",
            },
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات مرکز خدمات با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "مرکز خدمات با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class MedicalCenterViewSet(viewsets.ModelViewSet):
    queryset = MedicalCenter.objects.all().order_by("-created_at")
    serializer_class = MedicalCenterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["name", "type", "city", "state"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "ok": True,
                "data": self.get_serializer(instance).data,
                "message": "مرکز درمانی با موفقیت ثبت شد",
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات مرکز درمانی با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "مرکز درمانی با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class CharityCenterViewSet(viewsets.ModelViewSet):
    queryset = CharityCenter.objects.all().order_by("-created_at")
    serializer_class = CharityCenterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["name", "mainActivityArea", "city", "state"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "ok": True,
                "data": self.get_serializer(instance).data,
                "message": "مرکز نیکوکاری با موفقیت ثبت شد",
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def list(self, request, *args, **kwargs):
        # ... (منطق لیست مشابه ViewSet های قبلی)
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات مرکز نیکوکاری با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "مرکز نیکوکاری با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class GovernmentOrganizationViewSet(viewsets.ModelViewSet):
    queryset = GovernmentOrganization.objects.all().order_by("-created_at")
    serializer_class = GovernmentOrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["name", "type", "activityArea", "city"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "سازمان دولتی با موفقیت ثبت شد",
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات سازمان دولتی با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "سازمان دولتی با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )


class AssociationViewSet(viewsets.ModelViewSet):
    queryset = Association.objects.all().order_by("-created_at")
    serializer_class = AssociationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["name", "type", "mainActivityArea", "city"]

    def create(self, request, *args, **kwargs):
        # ... (منطق create مشابه ViewSet های قبلی)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"ok": True, "data": serializer.data, "message": "تشکل با موفقیت ثبت شد"},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def list(self, request, *args, **kwargs):
        # ... (منطق list مشابه ViewSet های قبلی)
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        # ... (منطق retrieve مشابه ViewSet های قبلی)
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        # ... (منطق update مشابه ViewSet های قبلی)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "اطلاعات تشکل با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        # ... (منطق destroy مشابه ViewSet های قبلی)
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "تشکل با موفقیت حذف شد"}, status=status.HTTP_200_OK
        )


class ConsultationRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت درخواست‌های مشاوره.
    """

    queryset = (
        ConsultationRequest.objects.select_related("user").all().order_by("-created_at")
    )
    serializer_class = ConsultationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__national_code",
        "subject",
    ]

    def get_serializer_context(self):
        """
        اطمینان از پاس دادن request به context سریالایزر.
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def create(self, request, *args, **kwargs):
        """
        ایجاد یک درخواست مشاوره جدید.
        منطق اصلی پیدا کردن کاربر با کد ملی در سریالایزر انجام می‌شود.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            # سریالایزر برای نمایش پاسخ، شامل اطلاعات کامل کاربر است
            response_serializer = self.get_serializer(instance)
            return Response(
                {
                    "ok": True,
                    "data": response_serializer.data,
                    "message": "درخواست مشاوره با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"ok": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def list(self, request, *args, **kwargs):
        """
        لیست تمام درخواست‌های مشاوره با قابلیت جستجو و صفحه‌بندی.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": self.pagination_class.page_size,
                        "current_page": int(request.query_params.get("page", 1)),
                        "total_pages": (
                            data["count"] + self.pagination_class.page_size - 1
                        )
                        // self.pagination_class.page_size,
                    },
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"ok": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        """
        دریافت جزئیات یک درخواست مشاوره خاص.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"ok": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        """
        بروزرسانی یک درخواست مشاوره (برای مثال تغییر وضعیت توسط ادمین).
        """
        instance = self.get_object()
        # در این سناریو، فقط فیلدهای خاصی مثل status باید قابل آپدیت باشند
        # این منطق را می‌توان در سریالایزر با read_only_fields مدیریت کرد
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "ok": True,
                "data": serializer.data,
                "message": "درخواست مشاوره با موفقیت بروزرسانی شد",
            }
        )

    def destroy(self, request, *args, **kwargs):
        """
        حذف یک درخواست مشاوره.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "درخواست مشاوره با موفقیت حذف شد"},
            status=status.HTTP_200_OK,
        )
