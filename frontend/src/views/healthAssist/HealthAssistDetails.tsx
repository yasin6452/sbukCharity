import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getHealthAssist, HealthAssistPerson } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiArrowRight, HiOutlineDocument } from 'react-icons/hi'

const HealthAssistDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [healthAssist, setHealthAssist] = useState<HealthAssistPerson | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHealthAssist = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getHealthAssist(parseInt(id))
                if (response.ok && response.data) {
                    setHealthAssist(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات سلامت‌یار
                        </Notification>
                    )
                    navigate('/health-assists')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/health-assists')
            } finally {
                setLoading(false)
            }
        }

        fetchHealthAssist()
    }, [id, navigate])

    const handleEdit = () => {
        navigate(`/health-assists/edit/${id}`)
    }

    const handleBack = () => {
        navigate('/health-assists')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!healthAssist) {
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
                            <h4 className="text-lg font-semibold">جزئیات اطلاعات سلامت‌یار</h4>
                        </div>
                        <Button
                            variant="solid"
                            icon={<HiOutlinePencil />}
                            onClick={handleEdit}
                        >
                            ویرایش
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* اطلاعات پایه */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات پایه</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">نام و نام خانوادگی</p>
                                    <p className="font-medium">
                                        {healthAssist.user ? `${healthAssist.user.first_name} ${healthAssist.user.last_name}` : 'نامشخص'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">کد ملی</p>
                                    <p className="font-medium">{healthAssist.user?.national_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">جنسیت</p>
                                    <p className="font-medium">{healthAssist.user?.gender}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">استان</p>
                                    <p className="font-medium">{healthAssist.user?.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهر</p>
                                    <p className="font-medium">{healthAssist.user?.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهرستان</p>
                                    <p className="font-medium">{healthAssist.user?.county}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 text-sm">آدرس</p>
                                    <p className="font-medium">{healthAssist.user?.homeAddress}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تحصیلات</p>
                                    <p className="font-medium">{healthAssist.user?.education}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نحوه آشنایی</p>
                                    <p className="font-medium">{healthAssist.user?.howKnow}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نوع کاربر</p>
                                    <p className="font-medium">{healthAssist.user?.userType}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن همراه</p>
                                    <p className="font-medium">{healthAssist.user?.phone_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات همکاری */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات همکاری</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">نوع همکاری</p>
                                    <p className="font-medium">{healthAssist.assistType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">توضیحات همکاری</p>
                                    <p className="font-medium">{healthAssist.assiteDescription}</p>
                                </div>
                                {healthAssist.letterFile && (
                                    <div>
                                        <p className="text-gray-500 text-sm">فایل معرفی‌نامه</p>
                                        <Button
                                            variant="plain"
                                            icon={<HiOutlineDocument />}
                                            onClick={() => window.open(healthAssist.letterFile!, '_blank')}
                                        >
                                            مشاهده فایل
                                        </Button>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 text-sm">تاریخ ثبت</p>
                                    <p className="font-medium">
                                        {new Date(healthAssist.created_at).toLocaleDateString('fa-IR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات معرف */}
                        {(healthAssist.presenterNationalCode || healthAssist.presenterFirstName || healthAssist.presenterLastName) && (
                            <div className="lg:col-span-3">
                                <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات معرف</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                    {healthAssist.presenterNationalCode && (
                                        <div>
                                            <p className="text-gray-500 text-sm">کد ملی معرف</p>
                                            <p className="font-medium">{healthAssist.presenterNationalCode}</p>
                                        </div>
                                    )}
                                    {healthAssist.presenterFirstName && (
                                        <div>
                                            <p className="text-gray-500 text-sm">نام معرف</p>
                                            <p className="font-medium">{healthAssist.presenterFirstName}</p>
                                        </div>
                                    )}
                                    {healthAssist.presenterLastName && (
                                        <div>
                                            <p className="text-gray-500 text-sm">نام خانوادگی معرف</p>
                                            <p className="font-medium">{healthAssist.presenterLastName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default HealthAssistDetails