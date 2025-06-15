// src/views/serviceCenter/ServiceCenterDetails.tsx

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight, HiOutlinePencil } from 'react-icons/hi'
import { getServiceCenter, ServiceCenter } from '@/services/data'

const DetailItem = ({ label, value, isLink }: { label: string, value?: string | null | number, isLink?: boolean }) => (
    value ? (
        <div className="mb-4">
            <p className="text-gray-500 text-sm">{label}</p>
            {isLink && typeof value === 'string' ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {value}
                </a>
            ) : (
                <p className="font-medium whitespace-pre-wrap">{String(value)}</p>
            )}
        </div>
    ) : null
);

const ServiceCenterDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [serviceCenter, setServiceCenter] = useState<ServiceCenter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenterDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getServiceCenter(parseInt(id));
                if (response.ok && response.data) {
                    setServiceCenter(response.data);
                } else {
                    toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت اطلاعات مرکز.'}</Notification>);
                    navigate('/service-centers');
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
                navigate('/service-centers');
            } finally {
                setLoading(false);
            }
        };
        fetchCenterDetails();
    }, [id, navigate]);

    const handleBack = () => {
        navigate('/service-centers');
    };

    const handleEdit = () => {
        navigate(`/service-centers/edit/${id}`);
    };

    if (loading) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    if (!serviceCenter) {
        return <div className="p-4 text-center">اطلاعات مرکز خدمات یافت نشد.</div>;
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Button variant="plain" icon={<HiArrowRight />} onClick={handleBack} className="mr-2" />
                            <h4 className="text-xl font-semibold">جزئیات مرکز خدمات: {serviceCenter.name}</h4>
                        </div>
                        <Button variant="solid" icon={<HiOutlinePencil />} onClick={handleEdit}> ویرایش </Button>
                    </div>

                    {/* START: بخش اصلی نمایش اطلاعات که حذف شده بود */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-6">
                            {/* اطلاعات عمومی */}
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات عمومی</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 p-2">
                                    <DetailItem label="نام مرکز" value={serviceCenter.name} />
                                    <DetailItem label="دسته بندی خدمات" value={serviceCenter.serviceCategory} />
                                    <DetailItem label="ایمیل" value={serviceCenter.email} />
                                    <DetailItem label="شماره تلفن" value={serviceCenter.phoneNumber} />
                                    <DetailItem label="وبسایت" value={serviceCenter.website} isLink={true} />
                                    <DetailItem label="ساعات کاری" value={serviceCenter.workingHours} />
                                    <DetailItem label="محدوده ارائه خدمات" value={serviceCenter.serviceArea} />
                                    <DetailItem label="وضعیت" value={serviceCenter.status} />
                                    <DetailItem label="تاریخ ثبت" value={new Date(serviceCenter.created_at).toLocaleDateString('fa-IR')} />
                                </div>
                            </section>
                             <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">شرح دقیق خدمات</h5>
                                <div className="p-2">
                                     <DetailItem label="" value={serviceCenter.detailedServices} />
                                  </div>
                            </section>
                        </div>
                        
                        <div className="md:col-span-4 space-y-6">
                             {/* آدرس */}
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">آدرس</h5>
                                <div className="p-2 space-y-2">
                                    <DetailItem label="استان" value={serviceCenter.state} />
                                    <DetailItem label="شهر" value={serviceCenter.city} />
                                    <DetailItem label="شهرستان/منطقه" value={serviceCenter.county} />
                                    <DetailItem label="جزئیات آدرس" value={serviceCenter.addressDetail} />
                                </div>
                            </section>
                            
                             {/* اطلاعات مسئول */}
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات فرد مسئول/رابط</h5>
                                <div className="p-2 space-y-2">
                                    <DetailItem label="نام و نام خانوادگی" value={serviceCenter.contactPersonName} />
                                    <DetailItem label="شماره موبایل" value={serviceCenter.contactPersonPhone} />
                                </div>
                            </section>

                             {/* مجوزها */}
                            {(serviceCenter.licenseNumber || serviceCenter.licenseFile) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">مجوزها</h5>
                                    <div className="p-2 space-y-2">
                                        <DetailItem label="شماره پروانه/مجوز" value={serviceCenter.licenseNumber} />
                                        {serviceCenter.licenseFile && (
                                            <div>
                                                <p className="text-gray-500 text-sm">فایل پروانه/مجوز</p>
                                                <a href={serviceCenter.licenseFile} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                                    مشاهده فایل
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                    
                    {/* توضیحات */}
                    {serviceCenter.description && (
                         <section className="mt-6">
                            <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">توضیحات تکمیلی</h5>
                            <div className="p-2">
                                <p className="whitespace-pre-wrap">{serviceCenter.description}</p>
                            </div>
                        </section>
                    )}
                    {/* END: بخش اصلی نمایش اطلاعات */}

                </div>
            </Card>
        </div>
    );
};

export default ServiceCenterDetails;