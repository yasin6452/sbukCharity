import exp from 'constants'
import ApiService from './ApiService'
import { ex } from '@fullcalendar/core/internal-common'

// تایپ‌های مربوط به کاربران و بیماران
export type CustomUser = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    national_code: string;
    gender: string;
    job: string | null;
    state: string;
    city: string;
    county: string;
    homeAddress: string;
    jobAddress: string | null;
    howKnow: string;
    education: string;
    userType: string;
};

export type Patient = {
    id: number;
    presenterNationalCode: string | null;
    presenterFirstName: string | null;
    presenterLastName: string | null;
    fatherName: string;
    age: number;
    maritalStatus: string;
    headHouseHold: boolean;
    numberDependents: number;
    familyStatus: string;
    jobStatus: boolean;
    skill: string;
    homeStatus: string;
    lineNumber: string;
    organ: string;
    bankCardNumber: string;
    insurance: string;
    sicknessDescription: string;
    familiar1Name: string;
    familiar1FamilyName: string;
    familiar1PhoneNumber: string;
    familiar2Name: string;
    familiar2FamilyName: string;
    familiar2PhoneNumber: string;
    nationalCardImage: string | null;
    nationalCertificateImage: string | null;
    user: CustomUser;
    // فیلد national_code حذف شد چون در ساختار داده وجود ندارد
};

export type PatientFormData = Omit<Patient, 'id' | 'user'>;

export type PaginatedResponse<T> = {
    ok: boolean;
    data: T[];
    pagination: {
        total_count: number;
        page_size: number;
        current_page: number;
        total_pages: number;
    };
    message?: string;
};

export type ApiResponse<T> = {
    ok: boolean;
    data: T;
    message?: string;
};

// توابع API برای بیماران
export async function getPatients(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Patient>> {
    return ApiService.fetchDataWithAxios({
        url: 'patients/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

export async function getPatient(id: number): Promise<ApiResponse<Patient>> {
    return ApiService.fetchDataWithAxios({
        url: `patients/${id}/`,
        method: 'get'
    });
}

export async function createPatient(data: PatientFormData): Promise<ApiResponse<Patient>> {
    return ApiService.fetchDataWithAxios({
        url: 'patients/',
        method: 'post',
        data
    });
}

export async function updatePatient(id: number, data: Partial<PatientFormData>): Promise<ApiResponse<Patient>> {
    return ApiService.fetchDataWithAxios({
        url: `patients/${id}/`,
        method: 'patch',
        data
    });
}

export async function deletePatient(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `patients/${id}/`,
        method: 'delete'
    });
}


export type BenefactorPerson = {
    id: number;
    landLineNumber: string;
    contribution: string;
    created_at: string;
    user: CustomUser;
};

export type BenefactorFormData = Omit<BenefactorPerson, 'id' | 'user' | 'created_at'> & {
    first_name: string;
    last_name: string;
    phone_number: string;
    gender: string;
    state: string;
    city: string;
    county: string;
    homeAddress: string;
    howKnow: string;
    education: string;
    userType: string;
    national_code: string;
};

// توابع API برای افراد خیر
export async function getBenefactors(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<BenefactorPerson>> {
    return ApiService.fetchDataWithAxios({
        url: 'benefactors/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

export async function getBenefactor(id: number): Promise<ApiResponse<BenefactorPerson>> {
    return ApiService.fetchDataWithAxios({
        url: `benefactors/${id}/`,
        method: 'get'
    });
}

export async function createBenefactor(data: BenefactorFormData): Promise<ApiResponse<BenefactorPerson>> {
    return ApiService.fetchDataWithAxios({
        url: 'benefactors/',
        method: 'post',
        data
    });
}

export async function updateBenefactor(id: number, data: Partial<BenefactorFormData>): Promise<ApiResponse<BenefactorPerson>> {
    return ApiService.fetchDataWithAxios({
        url: `benefactors/${id}/`,
        method: 'patch',
        data
    });
}

export async function deleteBenefactor(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `benefactors/${id}/`,
        method: 'delete'
    });
}

// افزودن تایپ‌ها
export type HealthAssistPerson = {
    id: number;
    presenterNationalCode: string | null;
    presenterFirstName: string | null;
    presenterLastName: string | null;
    letterFile: string | null;
    assistType: string;
    assiteDescription: string;
    created_at: string;
    user: CustomUser;
};

export type HealthAssistFormData = Omit<HealthAssistPerson, 'id' | 'user' | 'created_at'> & {
    first_name: string;
    last_name: string;
    phone_number: string;
    gender: string;
    state: string;
    city: string;
    county: string;
    homeAddress: string;
    howKnow: string;
    education: string;
    userType: string;
    national_code: string;
};

// توابع API برای اشخاص سلامت‌یار
export async function getHealthAssists(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<HealthAssistPerson>> {
    return ApiService.fetchDataWithAxios({
        url: 'health-assists/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

export async function getHealthAssist(id: number): Promise<ApiResponse<HealthAssistPerson>> {
    return ApiService.fetchDataWithAxios({
        url: `health-assists/${id}/`,
        method: 'get'
    });
}

export async function createHealthAssist(data: HealthAssistFormData): Promise<ApiResponse<HealthAssistPerson>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (key === 'letterFile' && value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    
    return ApiService.fetchDataWithAxios({
        url: 'health-assists/',
        method: 'post',
        data: formData
    });
}

export async function updateHealthAssist(id: number, data: Partial<HealthAssistFormData>): Promise<ApiResponse<HealthAssistPerson>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (key === 'letterFile' && value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    
    return ApiService.fetchDataWithAxios({
        url: `health-assists/${id}/`,
        method: 'patch',
        data: formData
    });
}

export async function deleteHealthAssist(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `health-assists/${id}/`,
        method: 'delete'
    });
}

export type Doctor = {
    id: number;
    fatherName: string;
    medicalCode: number;
    secPhoneNumber: string;
    specialty: string;
    services: string;
    collabType: string;
    contribution: string;
    created_at: string;
    user: CustomUser;
};

export type DoctorFormData = Omit<Doctor, 'id' | 'user' | 'created_at'> & {
    first_name: string;
    last_name: string;
    phone_number: string;
    gender: string;
    state: string;
    city: string;
    county: string;
    homeAddress: string;
    howKnow: string;
    education: string;
    userType: string;
    national_code: string;
};

// توابع API برای پزشکان
export async function getDoctors(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Doctor>> {
    return ApiService.fetchDataWithAxios({
        url: 'doctors/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

export async function getDoctor(id: number): Promise<ApiResponse<Doctor>> {
    return ApiService.fetchDataWithAxios({
        url: `doctors/${id}/`,
        method: 'get'
    });
}

export async function createDoctor(data: DoctorFormData): Promise<ApiResponse<Doctor>> {
    return ApiService.fetchDataWithAxios({
        url: 'doctors/',
        method: 'post',
        data
    });
}

export async function updateDoctor(id: number, data: Partial<DoctorFormData>): Promise<ApiResponse<Doctor>> {
    return ApiService.fetchDataWithAxios({
        url: `doctors/${id}/`,
        method: 'patch',
        data
    });
}

export async function deleteDoctor(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `doctors/${id}/`,
        method: 'delete'
    });
}

// افزودن تایپ‌ها
export type PrivateCompany = {
    id: number;
    name: string;
    yearFound: number;
    license: boolean;
    yearStart: number;
    yearLicense: number | null;
    licenseReference: string;
    activity: string;
    specializedArea: string;
    targetCommunity: string;
    shareableFeatures: string;
    nameCeo: string;
    phoneNumberCeo: string;
    nameCeo2: string | null;
    phoneNumberCeo2: string;
    landLineNumber: string;
    state: string;
    city: string;
    county: string;
    residentialAddress: string;
    workplaceAddress: string;
    scopeActivity: string;
    nameRepresentative: string;
    mobileRepresentative: string;
    membershipRequest: string | null;
    activityLicense: string | null;
    collectionLogo: string | null;
    created_at: string;
};

export type PrivateCompanyFormData = Omit<PrivateCompany, 'id' | 'created_at'>;

// توابع API برای شرکت‌های خصوصی
export async function getPrivateCompanies(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<PrivateCompany>> {
    return ApiService.fetchDataWithAxios({
        url: 'private-companies/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

export async function getPrivateCompany(id: number): Promise<ApiResponse<PrivateCompany>> {
    return ApiService.fetchDataWithAxios({
        url: `private-companies/${id}/`,
        method: 'get'
    });
}

export async function createPrivateCompany(data: PrivateCompanyFormData): Promise<ApiResponse<PrivateCompany>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    
    return ApiService.fetchDataWithAxios({
        url: 'private-companies/',
        method: 'post',
        data: formData
    });
}

export async function updatePrivateCompany(id: number, data: Partial<PrivateCompanyFormData>): Promise<ApiResponse<PrivateCompany>> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    
    return ApiService.fetchDataWithAxios({
        url: `private-companies/${id}/`,
        method: 'patch',
        data: formData
    });
}

export async function deletePrivateCompany(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `private-companies/${id}/`,
        method: 'delete'
    });
}

// data.ts - اضافه به فایل موجود

// تایپ درخواست سرویس بیمار
export type PatientServiceRequest = {
    id: number;
    usingResidence: boolean;
    numberOfWoman: number;
    numberOfMan: number;
    explain: string;
    neededService: string;
    created_at: string;
    user: CustomUser;
};

export type PatientServiceRequestFormData = {
    national_code: string;
    usingResidence: boolean;
    numberOfWoman: number;
    numberOfMan: number;
    explain: string;
    neededService: string;
};

// دریافت بیمار با کد ملی
export async function getPatientByNationalCode(nationalCode: string): Promise<ApiResponse<Patient>> {
    return ApiService.fetchDataWithAxios({
        url: `patients/by-national-code/${nationalCode}/`,
        method: 'get'
    });
}

// ثبت درخواست سرویس بیمار
export async function createPatientServiceRequest(data: PatientServiceRequestFormData): Promise<ApiResponse<PatientServiceRequest>> {
    return ApiService.fetchDataWithAxios({
        url: 'patient-service-requests/',
        method: 'post',
        data
    });
}

// دریافت لیست درخواست‌های سرویس بیمار
export async function getPatientServiceRequests(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<PatientServiceRequest>> {
    return ApiService.fetchDataWithAxios({
        url: 'patient-service-requests/',
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

// دریافت جزئیات درخواست سرویس بیمار
export async function getPatientServiceRequest(id: number): Promise<ApiResponse<PatientServiceRequest>> {
    return ApiService.fetchDataWithAxios({
        url: `patient-service-requests/${id}/`,
        method: 'get'
    });
}

// بروزرسانی درخواست سرویس بیمار
export async function updatePatientServiceRequest(id: number, data: Partial<PatientServiceRequestFormData>): Promise<ApiResponse<PatientServiceRequest>> {
    return ApiService.fetchDataWithAxios({
        url: `patient-service-requests/${id}/`,
        method: 'patch',
        data
    });
}

// حذف درخواست سرویس بیمار
export async function deletePatientServiceRequest(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `patient-service-requests/${id}/`,
        method: 'delete'
    });
}

export type ServiceCenter = {
    id: number;
    name: string;
    serviceCategory: string;
    detailedServices: string;
    email: string | null;
    phoneNumber: string;
    state: string;
    city: string;
    county: string;
    addressDetail: string;
    website: string | null;
    workingHours: string | null;
    contactPersonName: string;
    contactPersonPhone: string;
    licenseNumber: string | null;
    licenseFile: string | null; // <-- آدرس فایل از بک‌اند می‌آید
    serviceArea: string | null;
    description: string | null;
    status: string;
    created_at: string;
};

export type ServiceCenterFormData = Omit<ServiceCenter, 'id' | 'created_at' | 'licenseFile' | 'status'> & {
    licenseFile?: File | null; // برای آپلود فایل جدید
};


export async function getServiceCenters(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<ServiceCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'service-centers/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getServiceCenter(id: number): Promise<ApiResponse<ServiceCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `service-centers/${id}/`,
        method: 'get'
    });
}

export async function createServiceCenter(data: FormData): Promise<ApiResponse<ServiceCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'service-centers/',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateServiceCenter(id: number, data: FormData): Promise<ApiResponse<ServiceCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `service-centers/${id}/`,
        method: 'patch',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function deleteServiceCenter(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `service-centers/${id}/`,
        method: 'delete'
    });
}


export type MedicalCenter = {
    id: number;
    name: string;
    type: string;
    email: string;
    phoneNumber: string;
    state: string;
    city: string;
    county: string;
    addressDetail: string;
    website: string | null;
    services: string;
    workingHours: string | null;
    contactPersonName: string;
    contactPersonPhone: string;
    licenseNumber: string | null;
    licenseFile: string | null; // آدرس فایل از بک‌اند
    description: string | null;
    status: string;
    created_at: string;
};

export type MedicalCenterFormData = Omit<MedicalCenter, 'id' | 'created_at' | 'licenseFile' | 'status'> & {
    licenseFile?: File | null; // برای آپلود فایل
};

export async function getMedicalCenters(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<MedicalCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'medical-centers/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getMedicalCenter(id: number): Promise<ApiResponse<MedicalCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `medical-centers/${id}/`,
        method: 'get'
    });
}

export async function createMedicalCenter(data: FormData): Promise<ApiResponse<MedicalCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'medical-centers/',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateMedicalCenter(id: number, data: FormData): Promise<ApiResponse<MedicalCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `medical-centers/${id}/`,
        method: 'patch',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function deleteMedicalCenter(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `medical-centers/${id}/`,
        method: 'delete'
    });
}


export type CharityCenter = {
    id: number;
    name: string;
    mainActivityArea: string;
    type: string;
    registrationNumber: string | null;
    establishmentDate: string | null;
    missionAndGoals: string;
    email: string | null;
    phoneNumber: string;
    state: string;
    city: string;
    county: string;
    addressDetail: string;
    website: string | null;
    contactPersonName: string;
    contactPersonPhone: string;
    currentNeeds: string | null;
    donationMethods: string | null;
    charterOrLicenseFile: string | null; // URL از بک‌اند
    logo: string | null; // URL از بک‌اند
    description: string | null;
    status: string;
    created_at: string;
};

export type CharityCenterFormData = Omit<CharityCenter, 'id' | 'created_at' | 'charterOrLicenseFile' | 'logo' | 'status'> & {
    charterOrLicenseFile?: File | null;
    logoFile?: File | null; // نام فیلد در فرم با مدل متفاوت است
};


export async function getCharityCenters(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<CharityCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'charity-centers/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getCharityCenter(id: number): Promise<ApiResponse<CharityCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `charity-centers/${id}/`,
        method: 'get'
    });
}

export async function createCharityCenter(data: FormData): Promise<ApiResponse<CharityCenter>> {
    return ApiService.fetchDataWithAxios({
        url: 'charity-centers/',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateCharityCenter(id: number, data: FormData): Promise<ApiResponse<CharityCenter>> {
    return ApiService.fetchDataWithAxios({
        url: `charity-centers/${id}/`,
        method: 'patch',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function deleteCharityCenter(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `charity-centers/${id}/`,
        method: 'delete'
    });
}


export type GovernmentOrganization = {
    id: number;
    name: string;
    parentMinistryOrBody: string | null;
    type: string;
    activityArea: string;
    officialWebsite: string;
    mainPhoneNumber: string;
    faxNumber: string | null;
    officialEmail: string | null;
    state: string;
    city: string;
    county: string;
    centralAddressDetail: string;
    headPersonName: string;
    liaisonPersonName: string | null;
    liaisonPersonPhone: string | null;
    liaisonPersonEmail: string | null;
    collaborationLevel: string | null;
    description: string | null;
    logo: string | null; // URL از بک‌اند
    status: string;
    created_at: string;
};

export type GovernmentOrganizationFormData = Omit<GovernmentOrganization, 'id' | 'created_at' | 'logo' | 'status'> & {
    logoFile?: File | null;
};

export async function getGovernmentOrganizations(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<GovernmentOrganization>> {
    return ApiService.fetchDataWithAxios({
        url: 'government-organizations/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getGovernmentOrganization(id: number): Promise<ApiResponse<GovernmentOrganization>> {
    return ApiService.fetchDataWithAxios({
        url: `government-organizations/${id}/`,
        method: 'get'
    });
}

export async function createGovernmentOrganization(data: FormData): Promise<ApiResponse<GovernmentOrganization>> {
    return ApiService.fetchDataWithAxios({
        url: 'government-organizations/',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateGovernmentOrganization(id: number, data: FormData): Promise<ApiResponse<GovernmentOrganization>> {
    return ApiService.fetchDataWithAxios({
        url: `government-organizations/${id}/`,
        method: 'patch',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function deleteGovernmentOrganization(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `government-organizations/${id}/`,
        method: 'delete'
    });
}

export type Association = {
    id: number;
    name: string;
    type: string;
    mainActivityArea: string;
    missionAndVision: string;
    establishmentDate: string | null;
    registrationNumber: string | null;
    contactPhoneNumber: string;
    email: string | null;
    websiteOrSocialPage: string | null;
    state: string | null;
    city: string | null;
    county: string | null;
    addressDetail: string | null;
    headPersonName: string;
    headPersonPhone: string;
    estimatedMembersCount: number | null;
    membershipProcess: string | null;
    currentNeeds: string | null;
    logo: string | null; // URL از بک‌اند
    description: string | null;
    status: string;
    created_at: string;
};

export type AssociationFormData = Omit<Association, 'id' | 'created_at' | 'logo' | 'status' | 'estimatedMembersCount'> & {
    estimatedMembersCount?: string;
    logoFile?: File | null;
};

export async function getAssociations(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<Association>> {
    return ApiService.fetchDataWithAxios({
        url: 'associations/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getAssociation(id: number): Promise<ApiResponse<Association>> {
    return ApiService.fetchDataWithAxios({
        url: `associations/${id}/`,
        method: 'get'
    });
}

export async function createAssociation(data: FormData): Promise<ApiResponse<Association>> {
    return ApiService.fetchDataWithAxios({
        url: 'associations/',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateAssociation(id: number, data: FormData): Promise<ApiResponse<Association>> {
    return ApiService.fetchDataWithAxios({
        url: `associations/${id}/`,
        method: 'patch',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function deleteAssociation(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `associations/${id}/`,
        method: 'delete'
    });
}

export interface ConsultationRequest {
    id: number;
    user: CustomUser;
    subject: string;
    description: string;
    consultationType: string;
    preferredDate: string | null;
    preferredTime: string | null;
    status: string;
    created_at: string;
}

export interface ConsultationRequestFormData {
    national_code: string; 
    subject: string;
    description: string;
    preferredDate?: string;
    preferredTime?: string;
    consultationType: string; 
}

export async function getConsultationRequests(page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<ConsultationRequest>> {
    return ApiService.fetchDataWithAxios({
        url: 'consultation-requests/',
        method: 'get',
        params: { page, page_size: pageSize, search }
    });
}

export async function getConsultationRequest(id: number): Promise<ApiResponse<ConsultationRequest>> {
    return ApiService.fetchDataWithAxios({
        url: `consultation-requests/${id}/`,
        method: 'get'
    });
}

export async function createConsultationRequest(data: ConsultationRequestFormData): Promise<ApiResponse<ConsultationRequest>> {
    return ApiService.fetchDataWithAxios({
        url: 'consultation-requests/',
        method: 'post',
        data
    });
}

export async function deleteConsultationRequest(id: number): Promise<ApiResponse<null>> {
    return ApiService.fetchDataWithAxios({
        url: `consultation-requests/${id}/`,
        method: 'delete'
    });
}