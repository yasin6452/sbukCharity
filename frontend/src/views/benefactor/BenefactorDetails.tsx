import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getBenefactor, BenefactorPerson } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiArrowRight } from 'react-icons/hi'

const BenefactorDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [benefactor, setBenefactor] = useState<BenefactorPerson | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBenefactor = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getBenefactor(parseInt(id))
                if (response.ok && response.data) {
                    setBenefactor(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات فرد خیر
                        </Notification>
                    )
                    navigate('/benefactors')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/benefactors')
            } finally {
                setLoading(false)
            }
        }

        fetchBenefactor()
    }, [id, navigate])

    const handleEdit = () => {
        navigate(`/benefactors/edit/${id}`)
    }

    const handleBack = () => {
        navigate('/benefactors')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!benefactor) {
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
                            <h4 className="text-lg font-semibold">جزئیات اطلاعات فرد خیر</h4>
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
                                        {benefactor.user ? `${benefactor.user.first_name} ${benefactor.user.last_name}` : 'نامشخص'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">کد ملی</p>
                                    <p className="font-medium">{benefactor.user?.national_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">جنسیت</p>
                                    <p className="font-medium">{benefactor.user?.gender}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">استان</p>
                                    <p className="font-medium">{benefactor.user?.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهر</p>
                                    <p className="font-medium">{benefactor.user?.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهرستان</p>
                                    <p className="font-medium">{benefactor.user?.county}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 text-sm">آدرس</p>
                                    <p className="font-medium">{benefactor.user?.homeAddress}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تحصیلات</p>
                                    <p className="font-medium">{benefactor.user?.education}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نحوه آشنایی</p>
                                    <p className="font-medium">{benefactor.user?.howKnow}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نوع کاربر</p>
                                    <p className="font-medium">{benefactor.user?.userType}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن همراه</p>
                                    <p className="font-medium">{benefactor.user?.phone_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن ثابت</p>
                                    <p className="font-medium">{benefactor.landLineNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات مشارکت */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات مشارکت</h5>
                            <div className="p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">نوع مشارکت</p>
                                    <p className="font-medium whitespace-pre-line">{benefactor.contribution}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-500 text-sm">تاریخ ثبت</p>
                                    <p className="font-medium">
                                        {new Date(benefactor.created_at).toLocaleDateString('fa-IR')}
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

export default BenefactorDetails