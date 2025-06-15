import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatientServiceRequest, PatientServiceRequest } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight } from 'react-icons/hi'

const PatientServiceRequestDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [serviceRequest, setServiceRequest] = useState<PatientServiceRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServiceRequest = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getPatientServiceRequest(parseInt(id))
                if (response.ok && response.data) {
                    setServiceRequest(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات درخواست سرویس
                        </Notification>
                    )
                    navigate('/patient-service-requests')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/patient-service-requests')
            } finally {
                setLoading(false)
            }
        }

        fetchServiceRequest()
    }, [id, navigate])

    const handleBack = () => {
        navigate('/patient-service-requests')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!serviceRequest) {
        return null
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Button
                                variant="plain"
                                icon={<HiArrowRight />}
                                onClick={handleBack}
                                className="mr-2"
                            />
                            <h4 className="text-lg font-semibold">جزئیات درخواست سرویس بیمار</h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* اطلاعات بیمار */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات بیمار</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">نام و نام خانوادگی</p>
                                    <p className="font-medium">
                                        {serviceRequest.user
                                            ? `${serviceRequest.user.first_name} ${serviceRequest.user.last_name}`
                                            : 'نامشخص'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">کد ملی</p>
                                    <p className="font-medium">{serviceRequest.user?.national_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تلفن همراه</p>
                                    <p className="font-medium">{serviceRequest.user?.phone_number}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">آدرس</p>
                                    <p className="font-medium">{serviceRequest.user?.homeAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات درخواست */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات درخواست سرویس</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">استفاده از اقامتگاه</p>
                                    <p className="font-medium">{serviceRequest.usingResidence ? 'بله' : 'خیر'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تعداد زنان</p>
                                    <p className="font-medium">{serviceRequest.numberOfWoman} نفر</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تعداد مردان</p>
                                    <p className="font-medium">{serviceRequest.numberOfMan} نفر</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">مجموع افراد</p>
                                    <p className="font-medium">{serviceRequest.numberOfWoman + serviceRequest.numberOfMan} نفر</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تاریخ ثبت</p>
                                    <p className="font-medium">{new Date(serviceRequest.created_at).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">سرویس مورد نیاز</p>
                                    <p className="font-medium">{serviceRequest.neededService}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">توضیحات</p>
                                    <p className="font-medium">{serviceRequest.explain}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PatientServiceRequestDetails;