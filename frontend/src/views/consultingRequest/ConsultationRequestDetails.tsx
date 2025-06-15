import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getConsultationRequest, ConsultationRequest } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight } from 'react-icons/hi'

const ConsultationRequestDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [consultationRequest, setConsultationRequest] = useState<ConsultationRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (!id) return
            setLoading(true)
            try {
                const response = await getConsultationRequest(parseInt(id))
                if (response.ok && response.data) {
                    setConsultationRequest(response.data)
                } else {
                    toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت اطلاعات'}</Notification>)
                    navigate('/consultation-requests')
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>)
                navigate('/consultation-requests')
            } finally {
                setLoading(false)
            }
        }
        fetchRequestDetails()
    }, [id, navigate])

    const handleBack = () => navigate('/consultation-requests');

    if (loading) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>
    }

    if (!consultationRequest) {
        return <div className="p-4 text-center">اطلاعات درخواست یافت نشد.</div>
    }
    
    const { user } = consultationRequest;

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Button variant="plain" icon={<HiArrowRight />} onClick={handleBack} className="mr-2" />
                            <h4 className="text-lg font-semibold">جزئیات درخواست مشاوره</h4>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات بیمار</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                            <div><p className="text-gray-500 text-sm">نام و نام خانوادگی</p><p className="font-medium">{user.first_name} {user.last_name}</p></div>
                            <div><p className="text-gray-500 text-sm">کد ملی</p><p className="font-medium">{user.national_code}</p></div>
                            <div><p className="text-gray-500 text-sm">شماره موبایل</p><p className="font-medium">{user.phone_number}</p></div>
                            <div><p className="text-gray-500 text-sm">جنسیت</p><p className="font-medium">{user.gender}</p></div>
                            <div className="lg:col-span-2"><p className="text-gray-500 text-sm">آدرس منزل</p><p className="font-medium">{user.homeAddress}</p></div>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات درخواست</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                            <div className="lg:col-span-3"><p className="text-gray-500 text-sm">موضوع مشاوره</p><p className="font-medium">{consultationRequest.subject}</p></div>
                            <div className="lg:col-span-3"><p className="text-gray-500 text-sm">شرح درخواست</p><p className="font-medium whitespace-pre-wrap">{consultationRequest.description}</p></div>
                            <div><p className="text-gray-500 text-sm">نوع مشاوره</p><p className="font-medium">{consultationRequest.consultationType}</p></div>
                            <div><p className="text-gray-500 text-sm">تاریخ پیشنهادی</p><p className="font-medium">{consultationRequest.preferredDate || 'ثبت نشده'}</p></div>
                            <div><p className="text-gray-500 text-sm">زمان پیشنهادی</p><p className="font-medium">{consultationRequest.preferredTime || 'ثبت نشده'}</p></div>
                            <div><p className="text-gray-500 text-sm">وضعیت</p><p className="font-medium">{consultationRequest.status}</p></div>
                            <div><p className="text-gray-500 text-sm">تاریخ ثبت</p><p className="font-medium">{new Date(consultationRequest.created_at).toLocaleDateString('fa-IR')} - {new Date(consultationRequest.created_at).toLocaleTimeString('fa-IR')}</p></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ConsultationRequestDetails