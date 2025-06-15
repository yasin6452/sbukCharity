from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class customUser(AbstractUser):

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    phone_number = models.CharField(max_length=15)
    national_code = models.CharField(max_length=11,unique=True)
    gender = models.CharField(max_length=16)
    job = models.CharField(max_length=128,null=True)
    state = models.CharField(max_length=256)    
    city = models.CharField(max_length=256)
    county = models.CharField(max_length=256)
    homeAddress = models.CharField(max_length=512)  
    jobAddress = models.CharField(max_length=512,null=True)
    howKnow = models.CharField(max_length=128)
    education = models.CharField(max_length=128)
    userType = models.CharField(max_length=128)

class patient(models.Model) :
    national_code = models.ForeignKey(customUser,to_field="national_code",on_delete=models.CASCADE)
    presenterNationalCode = models.CharField(max_length=11,null=True,blank=True)
    presenterFirstName = models.CharField(max_length=11,null=True,blank=True)
    presenterLastName = models.CharField(max_length=11,null=True,blank=True)
    fatherName = models.CharField(max_length=128)
    age = models.IntegerField()
    maritalStatus = models.CharField(max_length=5)
    headHouseHold = models.BooleanField()
    numberDependents = models.IntegerField()
    familyStatus = models.CharField(max_length=1024)
    jobStatus = models.BooleanField()
    skill = models.CharField(max_length=128)
    homeStatus = models.CharField(max_length=32)
    lineNumber = models.CharField(max_length=15)
    organ = models.CharField(max_length=32)
    bankCardNumber = models.CharField(max_length=32)
    insurance = models.CharField(max_length=128)
    sicknessDescription = models.CharField(max_length=512)
    familiar1Name = models.CharField(max_length=128)
    familiar1FamilyName = models.CharField(max_length=128)
    familiar1PhoneNumber = models.CharField(max_length=15)
    familiar2Name = models.CharField(max_length=128)
    familiar2FamilyName = models.CharField(max_length=128)
    familiar2PhoneNumber = models.CharField(max_length=15)
    nationalCardImage = models.FileField(upload_to="patient/",null=True)
    nationalCertificateImage = models.FileField(upload_to="patient/",null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class benefactorPerson(models.Model) :
    national_code = models.ForeignKey(customUser,to_field="national_code",on_delete=models.CASCADE)
    landLineNumber = models.CharField(max_length=15)
    contribution = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)

class healthAssistPerson(models.Model) :
    national_code = models.ForeignKey(customUser,to_field="national_code",on_delete=models.CASCADE)
    presenterNationalCode = models.CharField(max_length=11,null=True,blank=True)
    presenterFirstName = models.CharField(max_length=11,null=True,blank=True)
    presenterLastName = models.CharField(max_length=11,null=True,blank=True)
    letterFile = models.FileField(upload_to="healthAssistLetter/",blank=True)
    assistType = models.CharField(max_length=512)
    assiteDescription = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

class doctor(models.Model) :
    national_code = models.ForeignKey(customUser,to_field="national_code",on_delete=models.CASCADE)
    fatherName = models.CharField(max_length=128)
    medicalCode = models.IntegerField()
    secPhoneNumber = models.CharField(max_length=15)
    specialty = models.CharField(max_length=128)
    services = models.CharField(max_length=128)
    collabType = models.CharField(max_length=128)
    contribution = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class privateCompany(models.Model):
    name = models.CharField(max_length=256)
    yearFound = models.IntegerField()
    license = models.BooleanField()
    yearStart = models.IntegerField()
    yearLicense = models.IntegerField(null=True, blank=True)
    licenseReference = models.CharField(max_length=128)
    activity = models.CharField(max_length=256)
    specializedArea = models.CharField(max_length=512)
    targetCommunity = models.CharField(max_length=512)
    shareableFeatures = models.CharField(max_length=512)
    nameCeo = models.CharField(max_length=128)
    phoneNumberCeo = models.CharField(max_length=15)
    nameCeo2 = models.CharField(max_length=128, null=True, blank=True)
    phoneNumberCeo2 = models.CharField(max_length=15)
    landLineNumber = models.CharField(max_length=15)
    state = models.CharField(max_length=256)    
    city = models.CharField(max_length=256)
    county = models.CharField(max_length=256)
    residentialAddress = models.CharField(max_length=512)
    workplaceAddress = models.CharField(max_length=512)
    scopeActivity = models.CharField(max_length=256)
    nameRepresentative = models.CharField(max_length=128)
    mobileRepresentative = models.CharField(max_length=15)
    membershipRequest = models.FileField(upload_to="company/",null=True,blank=True)
    activityLicense = models.FileField(upload_to="company/",null=True,blank=True)
    collectionLogo = models.FileField(upload_to="company/",null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class patientServicRequest(models.Model):
    national_code = models.ForeignKey(customUser,to_field="national_code",on_delete=models.CASCADE)
    usingResidence = models.BooleanField()
    numberOfWoman = models.IntegerField()
    numberOfMan = models.IntegerField()
    explain = models.CharField(max_length=512)
    neededService = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)

# class patientConsultationRequest(models.Model):
#     national_code = models.ForeignKey(customUser, to_field="national_code", on_delete=models.CASCADE)
#     register_way = models.CharField(max_length=128)
#     doctor_rep = models.CharField(max_length=128)
#     medical_center_name = models.CharField(max_length=256)
#     medical_center_number = models.CharField(max_length=15)
#     tracking_code = models.CharField(max_length=64, unique=True)
#     elementary_diagnosis = models.TextField()
#     doctor_sug = models.TextField()
#     health_file = models.FileField(upload_to="patientConsultationRequest/", null=True, blank=True)
#     doc_rep_letter = models.FileField(upload_to="patientConsultationRequest/", null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

class ServiceCenter(models.Model):
    name = models.CharField(max_length=255)
    serviceCategory = models.CharField(max_length=255)
    detailedServices = models.TextField()
    email = models.EmailField(blank=True, null=True)
    phoneNumber = models.CharField(max_length=20)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    addressDetail = models.TextField()
    website = models.URLField(blank=True, null=True)
    workingHours = models.CharField(max_length=255, blank=True, null=True)
    contactPersonName = models.CharField(max_length=255)
    contactPersonPhone = models.CharField(max_length=20)
    licenseNumber = models.CharField(max_length=100, blank=True, null=True)
    licenseFile = models.FileField(upload_to="service_centers/licenses/", blank=True, null=True)
    serviceArea = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='در انتظار تایید') # e.g., 'فعال', 'غیرفعال', 'در انتظار تایید'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class MedicalCenter(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100) # e.g., بیمارستان, کلینیک
    email = models.EmailField()
    phoneNumber = models.CharField(max_length=20)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    addressDetail = models.TextField()
    website = models.URLField(blank=True, null=True)
    services = models.TextField()
    workingHours = models.CharField(max_length=255, blank=True, null=True)
    contactPersonName = models.CharField(max_length=255)
    contactPersonPhone = models.CharField(max_length=20)
    licenseNumber = models.CharField(max_length=100, blank=True, null=True)
    licenseFile = models.FileField(upload_to="medical_centers/licenses/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='در انتظار تایید')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



class CharityCenter(models.Model):
    name = models.CharField(max_length=255)
    mainActivityArea = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    registrationNumber = models.CharField(max_length=100, blank=True, null=True)
    establishmentDate = models.CharField(max_length=50, blank=True, null=True)
    missionAndGoals = models.TextField()
    email = models.EmailField(blank=True, null=True)
    phoneNumber = models.CharField(max_length=20)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    addressDetail = models.TextField()
    website = models.URLField(blank=True, null=True)
    contactPersonName = models.CharField(max_length=255)
    contactPersonPhone = models.CharField(max_length=20)
    currentNeeds = models.TextField(blank=True, null=True)
    donationMethods = models.TextField(blank=True, null=True)
    charterOrLicenseFile = models.FileField(upload_to="charity_centers/charters/", blank=True, null=True)
    logo = models.FileField(upload_to="charity_centers/logos/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='در انتظار تایید')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GovernmentOrganization(models.Model):
    name = models.CharField(max_length=255)
    parentMinistryOrBody = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=100)
    activityArea = models.CharField(max_length=255)
    officialWebsite = models.URLField()
    mainPhoneNumber = models.CharField(max_length=20)
    faxNumber = models.CharField(max_length=20, blank=True, null=True)
    officialEmail = models.EmailField(blank=True, null=True)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    centralAddressDetail = models.TextField()
    headPersonName = models.CharField(max_length=255)
    liaisonPersonName = models.CharField(max_length=255, blank=True, null=True)
    liaisonPersonPhone = models.CharField(max_length=20, blank=True, null=True)
    liaisonPersonEmail = models.EmailField(blank=True, null=True)
    collaborationLevel = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    logo = models.FileField(upload_to="gov_orgs/logos/", blank=True, null=True)
    status = models.CharField(max_length=50, default='فعال')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Association(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    mainActivityArea = models.CharField(max_length=255)
    missionAndVision = models.TextField()
    establishmentDate = models.CharField(max_length=50, blank=True, null=True)
    registrationNumber = models.CharField(max_length=100, blank=True, null=True)
    contactPhoneNumber = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    websiteOrSocialPage = models.URLField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    county = models.CharField(max_length=100, blank=True, null=True)
    addressDetail = models.TextField(blank=True, null=True)
    headPersonName = models.CharField(max_length=255)
    headPersonPhone = models.CharField(max_length=20)
    estimatedMembersCount = models.PositiveIntegerField(blank=True, null=True)
    membershipProcess = models.TextField(blank=True, null=True)
    currentNeeds = models.TextField(blank=True, null=True)
    logo = models.FileField(upload_to="associations/logos/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='فعال')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ConsultationRequest(models.Model):
    CONSULTATION_TYPES = [
        ('آنلاین', 'آنلاین'),
        ('حضوری', 'حضوری'),
        ('تلفنی', 'تلفنی'),
    ]
    STATUS_CHOICES = [
        ('در انتظار بررسی', 'در انتظار بررسی'),
        ('پذیرفته شده', 'پذیرفته شده'),
        ('رد شده', 'رد شده'),
        ('انجام شده', 'انجام شده'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consultation_requests')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    consultationType = models.CharField(max_length=50, choices=CONSULTATION_TYPES)
    preferredDate = models.CharField(max_length=20, blank=True, null=True)
    preferredTime = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='در انتظار بررسی')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"درخواست مشاوره برای {self.user.get_full_name()} - موضوع: {self.subject}"