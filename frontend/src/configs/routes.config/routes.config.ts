import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },

    {
        key: 'patients',
        path: '/patients',
        component: lazy(() => import('@/views/patient/PatientList')),
        authority: [],
    },
    {
        key: 'patientCreate',
        path: '/patients/create',
        component: lazy(() => import('@/views/patient/PatientForm')),
        authority: [],
    },
    {
        key: 'patientEdit',
        path: '/patients/edit/:id',
        component: lazy(() => import('@/views/patient/PatientForm')),
        authority: [],
    },
    {
        key: 'patientView',
        path: '/patients/view/:id',
        component: lazy(() => import('@/views/patient/PatientDetails')),
        authority: [],
    },
    {
        key: 'benefactors',
        path: '/benefactors',
        component: lazy(() => import('@/views/benefactor/BenefactorList')),
        authority: [],
    },
    {
        key: 'benefactorCreate',
        path: '/benefactors/create',
        component: lazy(() => import('@/views/benefactor/BenefactorForm')),
        authority: [],
    },
    {
        key: 'benefactorEdit',
        path: '/benefactors/edit/:id',
        component: lazy(() => import('@/views/benefactor/BenefactorForm')),
        authority: [],
    },
    {
        key: 'benefactorView',
        path: '/benefactors/view/:id',
        component: lazy(() => import('@/views/benefactor/BenefactorDetails')),
        authority: [],
    },
    {
        key: 'healthAssists',
        path: '/health-assists',
        component: lazy(() => import('@/views/healthAssist/HealthAssistList')),
        authority: [],
    },
    {
        key: 'healthAssistCreate',
        path: '/health-assists/create',
        component: lazy(() => import('@/views/healthAssist/HealthAssistForm')),
        authority: [],
    },
    {
        key: 'healthAssistEdit',
        path: '/health-assists/edit/:id',
        component: lazy(() => import('@/views/healthAssist/HealthAssistForm')),
        authority: [],
    },
    {
        key: 'healthAssistView',
        path: '/health-assists/view/:id',
        component: lazy(() => import('@/views/healthAssist/HealthAssistDetails')),
        authority: [],
    },
    {
        key: 'doctors',
        path: '/doctors',
        component: lazy(() => import('@/views/doctor/DoctorList')),
        authority: [],
    },
    {
        key: 'doctorCreate',
        path: '/doctors/create',
        component: lazy(() => import('@/views/doctor/DoctorForm')),
        authority: [],
    },
    {
        key: 'doctorEdit',
        path: '/doctors/edit/:id',
        component: lazy(() => import('@/views/doctor/DoctorForm')),
        authority: [],
    },
    {
        key: 'doctorView',
        path: '/doctors/view/:id',
        component: lazy(() => import('@/views/doctor/DoctorDetails')),
        authority: [],
    },
    {
        key: 'privateCompanies',
        path: '/private-companies',
        component: lazy(() => import('@/views/privateCompany/PrivateCompanyList')),
        authority: [],
    },
    {
        key: 'privateCompanyCreate',
        path: '/private-companies/create',
        component: lazy(() => import('@/views/privateCompany/PrivateCompanyForm')),
        authority: [],
    },
    {
        key: 'privateCompanyEdit',
        path: '/private-companies/edit/:id',
        component: lazy(() => import('@/views/privateCompany/PrivateCompanyForm')),
        authority: [],
    },
    {
        key: 'privateCompanyView',
        path: '/private-companies/view/:id',
        component: lazy(() => import('@/views/privateCompany/PrivateCompanyDetails')),
        authority: [],
    },
    {
        key: 'patientServiceRequests',
        path: '/patient-service-requests',
        component: lazy(() => import('@/views/patientServiceRequest/PatientServiceRequestList')),
        authority: [],
    },
    {
        key: 'patientServiceRequestCreate',
        path: '/patient-service-requests/create',
        component: lazy(() => import('@/views/patientServiceRequest/PatientServiceRequestForm')),
        authority: [],
    },
    {
        key: 'patientServiceRequestView',
        path: '/patient-service-requests/view/:id',
        component: lazy(() => import('@/views/patientServiceRequest/PatientServiceRequestDetails')),
        authority: [],
    },

     {
        key: 'consultationRequestsList',
        path: '/consultation-requests',
        component: lazy(() => import('@/views/consultingRequest/ConsultationRequestList')),
        authority: [],
    },
    {
        key: 'consultationRequestCreate',
        path: '/consultation-requests/create',
        component: lazy(() => import('@/views/consultingRequest/ConsultationRequestForm')),
        authority: [],
    },
    {
        key: 'consultationRequestView',
        path: '/consultation-requests/view/:id',
        component: lazy(() => import('@/views/consultingRequest/ConsultationRequestDetails')),
        authority: [],
    },

    {
        key: 'medicalCentersList',
        path: '/medical-centers',
        component: lazy(() => import('@/views/medicalCenter/MedicalCenterList')),
        authority: [], 
    },
    {
        key: 'medicalCenterCreate',
        path: '/medical-centers/create',
        component: lazy(() => import('@/views/medicalCenter/MedicalCenterForm')),
        authority: [],
    },
    {
        key: 'medicalCenterEdit',
        path: '/medical-centers/edit/:id',
        component: lazy(() => import('@/views/medicalCenter/MedicalCenterForm')),
        authority: [],
    },
    {
        key: 'medicalCenterView',
        path: '/medical-centers/view/:id',
        component: lazy(() => import('@/views/medicalCenter/MedicalCenterDetails')),
        authority: [],
    },
    
    {
        key: 'serviceCentersList',
        path: '/service-centers',
        component: lazy(() => import('@/views/serviceCenter/ServiceCenterList')),
        authority: [], 
    },
    {
        key: 'serviceCenterCreate',
        path: '/service-centers/create',
        component: lazy(() => import('@/views/serviceCenter/ServiceCenterForm')),
        authority: [],
    },
    {
        key: 'serviceCenterEdit',
        path: '/service-centers/edit/:id',
        component: lazy(() => import('@/views/serviceCenter/ServiceCenterForm')),
        authority: [],
    },
    {
        key: 'serviceCenterView',
        path: '/service-centers/view/:id',
        component: lazy(() => import('@/views/serviceCenter/ServiceCenterDetails')),
        authority: [],
    },

    {
        key: 'charityCentersList',
        path: '/charity-centers',
        component: lazy(() => import('@/views/charityCenter/CharityCenterList')),
        authority: [], 
    },
    {
        key: 'charityCenterCreate',
        path: '/charity-centers/create',
        component: lazy(() => import('@/views/charityCenter/CharityCenterForm')),
        authority: [],
    },
    {
        key: 'charityCenterEdit',
        path: '/charity-centers/edit/:id',
        component: lazy(() => import('@/views/charityCenter/CharityCenterForm')),
        authority: [],
    },
    {
        key: 'charityCenterView',
        path: '/charity-centers/view/:id',
        component: lazy(() => import('@/views/charityCenter/CharityCenterDetails')),
        authority: [],
    },

    {
        key: 'governmentOrganizationsList',
        path: '/government-organizations',
        component: lazy(() => import('@/views/governmentOrganization/GovernmentOrganizationList')),
        authority: [], 
    },
    {
        key: 'governmentOrganizationCreate',
        path: '/government-organizations/create',
        component: lazy(() => import('@/views/governmentOrganization/GovernmentOrganizationForm')),
        authority: [],
    },
    {
        key: 'governmentOrganizationEdit',
        path: '/government-organizations/edit/:id',
        component: lazy(() => import('@/views/governmentOrganization/GovernmentOrganizationForm')),
        authority: [],
    },
    {
        key: 'governmentOrganizationView',
        path: '/government-organizations/view/:id',
        component: lazy(() => import('@/views/governmentOrganization/GovernmentOrganizationDetails')),
        authority: [],
    },

    {
        key: 'associationsList',
        path: '/associations',
        component: lazy(() => import('@/views/association/AssociationList')),
        authority: [], 
    },
    {
        key: 'associationCreate',
        path: '/associations/create',
        component: lazy(() => import('@/views/association/AssociationForm')),
        authority: [],
    },
    {
        key: 'associationEdit',
        path: '/associations/edit/:id',
        component: lazy(() => import('@/views/association/AssociationForm')),
        authority: [],
    },
    {
        key: 'associationView',
        path: '/associations/view/:id',
        component: lazy(() => import('@/views/association/AssociationDetails')),
        authority: [],
    },

    /** Example purpose only, please remove */
    // {
    //     key: 'singleMenuItem',
    //     path: '/single-menu-view',
    //     component: lazy(() => import('@/views/demo/SingleMenuView')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item1',
    //     path: '/collapse-menu-item-view-1',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item2',
    //     path: '/collapse-menu-item-view-2',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.single',
    //     path: '/group-single-menu-item-view',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupSingleMenuItemView')
    //     ),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item1',
    //     path: '/group-collapse-menu-item-view-1',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupCollapseMenuItemView1')
    //     ),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item2',
    //     path: '/group-collapse-menu-item-view-2',
    //     component: lazy(() =>
    //         import('@/views/demo/GroupCollapseMenuItemView2')
    //     ),
    //     authority: [],
    // },
    ...othersRoute,
]
