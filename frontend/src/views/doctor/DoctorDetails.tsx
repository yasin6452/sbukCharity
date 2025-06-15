import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getDoctor, Doctor } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiArrowRight } from 'react-icons/hi'

const DoctorDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getDoctor(parseInt(id))
                if (response.ok && response.data) {
                    setDoctor(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات پزشک
                        </Notification>
                    )
                    navigate('/doctors')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/doctors')
            } finally {
                setLoading(false)
            }
        }

        fetchDoctor()
    }, [id, navigate])

    const handleEdit = () => {
        navigate(`/doctors/edit/${id}`)
    }

    const handleBack = () => {
        navigate('/doctors')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!doctor) {
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
                            <h4 className="text-lg font-semibold">جزئیات اطلاعات پزشک</h4>
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
                                        {doctor.user ? `${doctor.user.first_name} ${doctor.user.last_name}` : 'نامشخص'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">کد ملی</p>
                                    <p className="font-medium">{doctor.user?.national_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نام پدر</p>
                                    <p className="font-medium">{doctor.fatherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">جنسیت</p>
                                    <p className="font-medium">{doctor.user?.gender}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">استان</p>
                                    <p className="font-medium">{doctor.user?.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهر</p>
                                    <p className="font-medium">{doctor.user?.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهرستان</p>
                                    <p className="font-medium">{doctor.user?.county}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 text-sm">آدرس</p>
                                    <p className="font-medium">{doctor.user?.homeAddress}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تحصیلات</p>
                                    <p className="font-medium">{doctor.user?.education}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نحوه آشنایی</p>
                                    <p className="font-medium">{doctor.user?.howKnow}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نوع کاربر</p>
                                    <p className="font-medium">{doctor.user?.userType}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن همراه</p>
                                    <p className="font-medium">{doctor.user?.phone_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تماس منشی/دوم</p>
                                    <p className="font-medium">{doctor.secPhoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات پزشکی و همکاری */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات پزشکی و همکاری</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">کد نظام پزشکی</p>
                                    <p className="font-medium">{doctor.medicalCode}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تخصص</p>
                                    <p className="font-medium">{doctor.specialty}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">خدمات</p>
                                    <p className="font-medium">{doctor.services}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نوع همکاری</p>
                                    <p className="font-medium">{doctor.collabType}</p>
                                </div>
                                <div className="md:col-span-3">
                                    <p className="text-gray-500 text-sm">شرح همکاری</p>
                                    <p className="font-medium whitespace-pre-line">{doctor.contribution}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تاریخ ثبت</p>
                                    <p className="font-medium">
                                        {new Date(doctor.created_at).toLocaleDateString('fa-IR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default DoctorDetails