from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 'phone_number',
            'national_code', 'gender', 'job', 'state', 'city', 'county',
            'homeAddress', 'jobAddress', 'howKnow', 'education', 'userType'
        ]

class PatientSerializer(serializers.ModelSerializer):
    # فیلدهای کاربر
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=True)
    gender = serializers.CharField(write_only=True, required=True)
    state = serializers.CharField(write_only=True, required=True)
    city = serializers.CharField(write_only=True, required=True)
    county = serializers.CharField(write_only=True, required=True)
    homeAddress = serializers.CharField(write_only=True, required=True)
    howKnow = serializers.CharField(write_only=True, required=True)
    education = serializers.CharField(write_only=True, required=True)
    userType = serializers.CharField(write_only=True, required=True)
    
    # تغییر نام فیلد از national_code_str به national_code
    national_code = serializers.CharField(write_only=True)
    
    user = CustomUserSerializer(source='national_code', read_only=True)
    
    class Meta:
        model = patient
        fields = [
            'id', 'presenterNationalCode', 'presenterFirstName',
            'presenterLastName', 'fatherName', 'age', 'maritalStatus', 'headHouseHold',
            'numberDependents', 'familyStatus', 'jobStatus', 'skill', 'homeStatus',
            'lineNumber', 'organ', 'bankCardNumber', 'insurance', 'sicknessDescription',
            'familiar1Name', 'familiar1FamilyName', 'familiar1PhoneNumber',
            'familiar2Name', 'familiar2FamilyName', 'familiar2PhoneNumber',
            'nationalCardImage', 'nationalCertificateImage', 'user',
            # فیلدهای کاربر
            'first_name', 'last_name', 'phone_number', 'gender', 'state', 'city',
            'county', 'homeAddress', 'howKnow', 'education', 'userType',
            # تغییر به national_code
            'national_code'
        ]
    
    def create(self, validated_data):
        # استخراج کد ملی به صورت رشته
        national_code_str = validated_data.pop('national_code')
        
        # اطلاعات کاربر
        user_data = {
            'username': national_code_str,
            'password': national_code_str,  # پسورد اولیه
            'email': f"{national_code_str}@example.com",  # ایمیل پیش‌فرض
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone_number': validated_data.pop('phone_number'),
            'national_code': national_code_str,
            'gender': validated_data.pop('gender'),
            'state': validated_data.pop('state'),
            'city': validated_data.pop('city'),
            'county': validated_data.pop('county'),
            'homeAddress': validated_data.pop('homeAddress'),
            'howKnow': validated_data.pop('howKnow'),
            'education': validated_data.pop('education'),
            'userType': validated_data.pop('userType'),
            'job': None,
            'jobAddress': None,
        }
        
        # بررسی وجود کاربر با کد ملی یکسان
        try:
            user = User.objects.get(national_code=national_code_str)
        except User.DoesNotExist:
            # ایجاد کاربر جدید
            try:
                user = User.objects.create_user(**user_data)
            except Exception as e:
                print(f"Error creating user: {str(e)}")
                raise serializers.ValidationError({"error": f"خطا در ایجاد کاربر: {str(e)}"})
        
        # ایجاد بیمار با ارجاع به کاربر
        try:
            patient_instance = patient.objects.create(
                national_code=user,  # ارسال شیء کاربر به جای رشته
                **validated_data
            )
            return patient_instance
        except Exception as e:
            print(f"Error creating patient: {str(e)}")
            raise serializers.ValidationError({"error": f"خطا در ایجاد بیمار: {str(e)}"})


class BenefactorPersonSerializer(serializers.ModelSerializer):
    # فیلدهای کاربر
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=True)
    gender = serializers.CharField(write_only=True, required=True)
    state = serializers.CharField(write_only=True, required=True)
    city = serializers.CharField(write_only=True, required=True)
    county = serializers.CharField(write_only=True, required=True)
    homeAddress = serializers.CharField(write_only=True, required=True)
    howKnow = serializers.CharField(write_only=True, required=True)
    education = serializers.CharField(write_only=True, required=True)
    userType = serializers.CharField(write_only=True, required=True)
    
    national_code = serializers.CharField(write_only=True)
    
    user = CustomUserSerializer(source='national_code', read_only=True)
    
    class Meta:
        model = benefactorPerson
        fields = [
            'id', 'landLineNumber', 'contribution', 'created_at', 'user',
            # فیلدهای کاربر
            'first_name', 'last_name', 'phone_number', 'gender', 'state', 'city',
            'county', 'homeAddress', 'howKnow', 'education', 'userType',
            'national_code'
        ]
    
    def create(self, validated_data):
        # استخراج کد ملی به صورت رشته
        national_code_str = validated_data.pop('national_code')
        
        # اطلاعات کاربر
        user_data = {
            'username': national_code_str,
            'password': national_code_str,
            'email': f"{national_code_str}@example.com",
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone_number': validated_data.pop('phone_number'),
            'national_code': national_code_str,
            'gender': validated_data.pop('gender'),
            'state': validated_data.pop('state'),
            'city': validated_data.pop('city'),
            'county': validated_data.pop('county'),
            'homeAddress': validated_data.pop('homeAddress'),
            'howKnow': validated_data.pop('howKnow'),
            'education': validated_data.pop('education'),
            'userType': validated_data.pop('userType'),
            'job': None,
            'jobAddress': None,
        }
        
        # بررسی وجود کاربر با کد ملی یکسان
        try:
            user = User.objects.get(national_code=national_code_str)
        except User.DoesNotExist:
            # ایجاد کاربر جدید
            user = User.objects.create_user(**user_data)
        
        # ایجاد فرد خیر
        benefactor_instance = benefactorPerson.objects.create(
            national_code=user,
            **validated_data
        )
        return benefactor_instance
    

class HealthAssistPersonSerializer(serializers.ModelSerializer):
    # فیلدهای کاربر
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=True)
    gender = serializers.CharField(write_only=True, required=True)
    state = serializers.CharField(write_only=True, required=True)
    city = serializers.CharField(write_only=True, required=True)
    county = serializers.CharField(write_only=True, required=True)
    homeAddress = serializers.CharField(write_only=True, required=True)
    howKnow = serializers.CharField(write_only=True, required=True)
    education = serializers.CharField(write_only=True, required=True)
    userType = serializers.CharField(write_only=True, required=True)
    
    national_code = serializers.CharField(write_only=True)
    
    user = CustomUserSerializer(source='national_code', read_only=True)
    
    class Meta:
        model = healthAssistPerson
        fields = [
            'id', 'presenterNationalCode', 'presenterFirstName', 
            'presenterLastName', 'letterFile', 'assistType', 
            'assiteDescription', 'created_at', 'user',
            # فیلدهای کاربر
            'first_name', 'last_name', 'phone_number', 'gender', 'state', 'city',
            'county', 'homeAddress', 'howKnow', 'education', 'userType',
            'national_code'
        ]
    
    def create(self, validated_data):
        # استخراج کد ملی به صورت رشته
        national_code_str = validated_data.pop('national_code')
        
        # اطلاعات کاربر
        user_data = {
            'username': national_code_str,
            'password': national_code_str,
            'email': f"{national_code_str}@example.com",
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone_number': validated_data.pop('phone_number'),
            'national_code': national_code_str,
            'gender': validated_data.pop('gender'),
            'state': validated_data.pop('state'),
            'city': validated_data.pop('city'),
            'county': validated_data.pop('county'),
            'homeAddress': validated_data.pop('homeAddress'),
            'howKnow': validated_data.pop('howKnow'),
            'education': validated_data.pop('education'),
            'userType': validated_data.pop('userType'),
            'job': None,
            'jobAddress': None,
        }
        
        # بررسی وجود کاربر با کد ملی یکسان
        try:
            user = User.objects.get(national_code=national_code_str)
        except User.DoesNotExist:
            # ایجاد کاربر جدید
            user = User.objects.create_user(**user_data)
        
        # ایجاد شخص سلامت‌یار
        health_assist_instance = healthAssistPerson.objects.create(
            national_code=user,
            **validated_data
        )
        return health_assist_instance

class DoctorSerializer(serializers.ModelSerializer):
    # فیلدهای کاربر
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=True)
    gender = serializers.CharField(write_only=True, required=True)
    state = serializers.CharField(write_only=True, required=True)
    city = serializers.CharField(write_only=True, required=True)
    county = serializers.CharField(write_only=True, required=True)
    homeAddress = serializers.CharField(write_only=True, required=True)
    howKnow = serializers.CharField(write_only=True, required=True)
    education = serializers.CharField(write_only=True, required=True)
    userType = serializers.CharField(write_only=True, required=True)
    
    national_code = serializers.CharField(write_only=True)
    
    user = CustomUserSerializer(source='national_code', read_only=True)
    
    class Meta:
        model = doctor
        fields = [
            'id', 'fatherName', 'medicalCode', 'secPhoneNumber', 
            'specialty', 'services', 'collabType', 'contribution', 
            'created_at', 'user',
            # فیلدهای کاربر
            'first_name', 'last_name', 'phone_number', 'gender', 'state', 'city',
            'county', 'homeAddress', 'howKnow', 'education', 'userType',
            'national_code'
        ]
    
    def create(self, validated_data):
        # استخراج کد ملی به صورت رشته
        national_code_str = validated_data.pop('national_code')
        
        # اطلاعات کاربر
        user_data = {
            'username': national_code_str,
            'password': national_code_str,
            'email': f"{national_code_str}@example.com",
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone_number': validated_data.pop('phone_number'),
            'national_code': national_code_str,
            'gender': validated_data.pop('gender'),
            'state': validated_data.pop('state'),
            'city': validated_data.pop('city'),
            'county': validated_data.pop('county'),
            'homeAddress': validated_data.pop('homeAddress'),
            'howKnow': validated_data.pop('howKnow'),
            'education': validated_data.pop('education'),
            'userType': validated_data.pop('userType'),
            'job': None,
            'jobAddress': None,
        }
        
        # بررسی وجود کاربر با کد ملی یکسان
        try:
            user = User.objects.get(national_code=national_code_str)
        except User.DoesNotExist:
            # ایجاد کاربر جدید
            user = User.objects.create_user(**user_data)
        
        # ایجاد پزشک
        doctor_instance = doctor.objects.create(
            national_code=user,
            **validated_data
        )
        return doctor_instance

class PrivateCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = privateCompany
        fields = [
            'id', 'name', 'yearFound', 'license', 'yearStart', 'yearLicense',
            'licenseReference', 'activity', 'specializedArea', 'targetCommunity',
            'shareableFeatures', 'nameCeo', 'phoneNumberCeo', 'nameCeo2',
            'phoneNumberCeo2', 'landLineNumber', 'state', 'city', 'county',
            'residentialAddress', 'workplaceAddress', 'scopeActivity',
            'nameRepresentative', 'mobileRepresentative', 'membershipRequest',
            'activityLicense', 'collectionLogo', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate(self, data):
        # اعتبارسنجی سال‌ها
        if 'yearFound' in data and 'yearStart' in data:
            if data['yearStart'] < data['yearFound']:
                raise serializers.ValidationError({
                    'yearStart': 'سال شروع فعالیت نمی‌تواند قبل از سال تأسیس باشد'
                })
        
        if 'license' in data and data['license'] and 'yearLicense' in data:
            if data.get('yearLicense') and data['yearLicense'] < data.get('yearFound', 0):
                raise serializers.ValidationError({
                    'yearLicense': 'سال اخذ مجوز نمی‌تواند قبل از سال تأسیس باشد'
                })
        
        return data

class PatientServiceRequestSerializer(serializers.ModelSerializer):
    national_code = serializers.CharField(write_only=True)
    
    user = CustomUserSerializer(source='national_code', read_only=True)
    
    class Meta:
        model = patientServicRequest
        fields = [
            'id', 'usingResidence', 'numberOfWoman', 'numberOfMan', 
            'explain', 'neededService', 'created_at', 'national_code', 'user'
        ]
    
    def create(self, validated_data):
        national_code_str = validated_data.pop('national_code')
        
        try:
            user = customUser.objects.get(national_code=national_code_str)
        except customUser.DoesNotExist:
            raise serializers.ValidationError({"error": "کاربر با این کد ملی یافت نشد"})
        
        service_request = patientServicRequest.objects.create(
            national_code=user,
            **validated_data
        )
        return service_request
    
    def update(self, instance, validated_data):
        if 'national_code' in validated_data:
            validated_data.pop('national_code')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ServiceCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCenter
        fields = '__all__'
        read_only_fields = ['created_at']

class MedicalCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalCenter
        fields = '__all__'
        read_only_fields = ['created_at']

class CharityCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharityCenter
        fields = '__all__'
        read_only_fields = ['created_at']

class GovernmentOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentOrganization
        fields = '__all__'
        read_only_fields = ['created_at']

class AssociationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Association
        fields = '__all__'
        read_only_fields = ['created_at']

class ConsultationRequestSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    national_code = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = ConsultationRequest
        fields = [
            'id', 'user', 'national_code', 'subject', 'description', 'consultationType', 
            'preferredDate', 'preferredTime', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at']

    def create(self, validated_data):
        national_code = validated_data.pop('national_code')
        User = get_user_model()
        try:
            user = User.objects.get(national_code=national_code)
        except User.DoesNotExist:
            raise serializers.ValidationError({'national_code': 'بیماری با این کد ملی یافت نشد.'})

        # Check if the user is a patient
        if not hasattr(user, 'patient'):
             raise serializers.ValidationError({'national_code': 'کاربر یافت شد اما پروفایل بیمار ندارد.'})

        consultation_request = ConsultationRequest.objects.create(user=user, **validated_data)
        return consultation_request