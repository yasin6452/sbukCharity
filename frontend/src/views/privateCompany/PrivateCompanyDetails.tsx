import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getPrivateCompany, PrivateCompany } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiArrowRight, HiOutlineDocument, HiOutlinePhotograph } from 'react-icons/hi'

const PrivateCompanyDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [company, setCompany] = useState<PrivateCompany | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getPrivateCompany(parseInt(id))
                if (response.ok && response.data) {
                    setCompany(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات شرکت خصوصی
                        </Notification>
                    )
                    navigate('/private-companies')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/private-companies')
            } finally {
                setLoading(false)
            }
        }

        fetchCompany()
    }, [id, navigate])

    const handleEdit = () => {
        navigate(`/private-companies/edit/${id}`)
    }

    const handleBack = () => {
        navigate('/private-companies')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!company) {
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
                            <h4 className="text-lg font-semibold">جزئیات اطلاعات شرکت خصوصی</h4>
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
                                    <p className="text-gray-500 text-sm">نام شرکت</p>
                                    <p className="font-medium">{company.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">سال تأسیس</p>
                                    <p className="font-medium">{company.yearFound}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">سال شروع فعالیت</p>
                                    <p className="font-medium">{company.yearStart}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">وضعیت مجوز</p>
                                    <p className="font-medium">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            company.license 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {company.license ? 'دارای مجوز' : 'فاقد مجوز'}
                                        </span>
                                    </p>
                                </div>
                                {company.license && company.yearLicense && (
                                    <div>
                                        <p className="text-gray-500 text-sm">سال اخذ مجوز</p>
                                        <p className="font-medium">{company.yearLicense}</p>
                                    </div>
                                )}
                                {company.license && (
                                    <div>
                                        <p className="text-gray-500 text-sm">مرجع صدور مجوز</p>
                                        <p className="font-medium">{company.licenseReference}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* اطلاعات فعالیت */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات فعالیت</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">فعالیت‌ها</p>
                                    <p className="font-medium whitespace-pre-line">{company.activity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">حوزه تخصصی</p>
                                    <p className="font-medium">{company.specializedArea}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">جامعه هدف</p>
                                    <p className="font-medium">{company.targetCommunity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">حوزه فعالیت</p>
                                    <p className="font-medium">{company.scopeActivity}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">ویژگی‌های قابل به اشتراک‌گذاری</p>
                                    <p className="font-medium whitespace-pre-line">{company.shareableFeatures}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات مدیران */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات مدیران</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">نام مدیرعامل</p>
                                    <p className="font-medium">{company.nameCeo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تماس مدیرعامل</p>
                                    <p className="font-medium">{company.phoneNumberCeo}</p>
                                </div>
                                {company.nameCeo2 && (
                                    <div>
                                        <p className="text-gray-500 text-sm">نام مدیرعامل دوم</p>
                                        <p className="font-medium">{company.nameCeo2}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تماس مدیرعامل دوم</p>
                                    <p className="font-medium">{company.phoneNumberCeo2}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نام نماینده</p>
                                    <p className="font-medium">{company.nameRepresentative}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره موبایل نماینده</p>
                                    <p className="font-medium">{company.mobileRepresentative}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس و آدرس */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس و آدرس</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن ثابت</p>
                                    <p className="font-medium">{company.landLineNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">استان</p>
                                    <p className="font-medium">{company.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهر</p>
                                    <p className="font-medium">{company.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شهرستان</p>
                                    <p className="font-medium">{company.county}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">آدرس سکونت</p>
                                    <p className="font-medium">{company.residentialAddress}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-gray-500 text-sm">آدرس محل کار</p>
                                    <p className="font-medium">{company.workplaceAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* مدارک و فایل‌ها */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">مدارک و فایل‌ها</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                {company.membershipRequest && (
                                    <div className="border rounded p-4 flex flex-col items-center justify-center">
                                        <HiOutlineDocument className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium mb-2">درخواست عضویت</p>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            onClick={() => window.open(company.membershipRequest!, '_blank')}
                                        >
                                            مشاهده فایل
                                        </Button>
                                    </div>
                                )}
                                {company.activityLicense && (
                                    <div className="border rounded p-4 flex flex-col items-center justify-center">
                                        <HiOutlineDocument className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium mb-2">مجوز فعالیت</p>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            onClick={() => window.open(company.activityLicense!, '_blank')}
                                        >
                                            مشاهده فایل
                                        </Button>
                                    </div>
                                )}
                                {company.collectionLogo && (
                                    <div className="border rounded p-4 flex flex-col items-center justify-center">
                                        <HiOutlinePhotograph className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium mb-2">لوگوی شرکت</p>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            onClick={() => window.open(company.collectionLogo!, '_blank')}
                                        >
                                            مشاهده تصویر
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* اطلاعات ثبت */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات ثبت</h5>
                            <div className="p-2">
                                <p className="text-gray-500 text-sm">تاریخ ثبت</p>
                                <p className="font-medium">
                                    {new Date(company.created_at).toLocaleDateString('fa-IR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default PrivateCompanyDetails