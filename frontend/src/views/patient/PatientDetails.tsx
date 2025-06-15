import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatient, Patient } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiArrowRight } from 'react-icons/hi'

const PatientDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPatient = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await getPatient(parseInt(id))
                if (response.ok && response.data) {
                    setPatient(response.data)
                } else {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در دریافت اطلاعات بیمار
                        </Notification>
                    )
                    navigate('/patients')
                }
            } catch (error) {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در ارتباط با سرور
                    </Notification>
                )
                navigate('/patients')
            } finally {
                setLoading(false)
            }
        }

        fetchPatient()
    }, [id, navigate])

    const handleEdit = () => {
        navigate(`/patients/edit/${id}`)
    }

    const handleBack = () => {
        navigate('/patients')
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!patient) {
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
                            <h4 className="text-lg font-semibold">جزئیات اطلاعات بیمار</h4>
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
                                        {patient.user
                                            ? `${patient.user.first_name} ${patient.user.last_name}`
                                            : 'نامشخص'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">کد ملی</p>
                                    <p className="font-medium">{patient.national_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">نام پدر</p>
                                    <p className="font-medium">{patient.fatherName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">سن</p>
                                    <p className="font-medium">{patient.age} سال</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">وضعیت تأهل</p>
                                    <p className="font-medium">{patient.maritalStatus}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">سرپرست خانوار</p>
                                    <p className="font-medium">{patient.headHouseHold ? 'بله' : 'خیر'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">تعداد افراد تحت تکفل</p>
                                    <p className="font-medium">{patient.numberDependents} نفر</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 text-sm">وضعیت خانواده</p>
                                    <p className="font-medium">{patient.familyStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات معرف */}
                        {(patient.presenterNationalCode || patient.presenterFirstName || patient.presenterLastName) && (
                            <div className="lg:col-span-3">
                                <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات معرف</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                    {patient.presenterNationalCode && (
                                        <div>
                                            <p className="text-gray-500 text-sm">کد ملی معرف</p>
                                            <p className="font-medium">{patient.presenterNationalCode}</p>
                                        </div>
                                    )}
                                    {patient.presenterFirstName && (
                                        <div>
                                            <p className="text-gray-500 text-sm">نام معرف</p>
                                            <p className="font-medium">{patient.presenterFirstName}</p>
                                        </div>
                                    )}
                                    {patient.presenterLastName && (
                                        <div>
                                            <p className="text-gray-500 text-sm">نام خانوادگی معرف</p>
                                            <p className="font-medium">{patient.presenterLastName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* اطلاعات شغلی و مسکن */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات شغلی و مسکن</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">وضعیت شغلی</p>
                                    <p className="font-medium">{patient.jobStatus ? 'شاغل' : 'غیر شاغل'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">مهارت</p>
                                    <p className="font-medium">{patient.skill}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">وضعیت مسکن</p>
                                    <p className="font-medium">{patient.homeStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات تماس و بانکی */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس و بانکی</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن همراه</p>
                                    <p className="font-medium">{patient.user?.phone_number || 'نامشخص'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره تلفن ثابت</p>
                                    <p className="font-medium">{patient.lineNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">شماره کارت بانکی</p>
                                    <p className="font-medium">{patient.bankCardNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">بیمه</p>
                                    <p className="font-medium">{patient.insurance}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 text-sm">آدرس</p>
                                    <p className="font-medium">{patient.user?.homeAddress || 'نامشخص'}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات بیماری */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات بیماری</h5>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-2">
                                <div>
                                    <p className="text-gray-500 text-sm">عضو بیمار</p>
                                    <p className="font-medium">{patient.organ}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">توضیحات بیماری</p>
                                    <p className="font-medium">{patient.sicknessDescription}</p>
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات آشنایان */}
                        <div className="lg:col-span-3">
                            <h5 className="text-md font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات آشنایان</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                <div className="border p-3 rounded">
                                    <h6 className="font-medium mb-2">آشنای اول</h6>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <p className="text-gray-500 text-sm">نام و نام خانوادگی</p>
                                            <p className="font-medium">{patient.familiar1Name} {patient.familiar1FamilyName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">شماره تماس</p>
                                            <p className="font-medium">{patient.familiar1PhoneNumber}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border p-3 rounded">
                                    <h6 className="font-medium mb-2">آشنای دوم</h6>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <p className="text-gray-500 text-sm">نام و نام خانوادگی</p>
                                            <p className="font-medium">{patient.familiar2Name} {patient.familiar2FamilyName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">شماره تماس</p>
                                            <p className="font-medium">{patient.familiar2PhoneNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default PatientDetails