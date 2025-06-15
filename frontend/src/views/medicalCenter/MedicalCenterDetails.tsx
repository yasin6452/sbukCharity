import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight, HiOutlinePencil } from 'react-icons/hi'
import { getMedicalCenter, MedicalCenter } from '@/services/data'

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

const MedicalCenterDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [medicalCenter, setMedicalCenter] = useState<MedicalCenter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenterDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getMedicalCenter(parseInt(id));
                if (response.ok && response.data) {
                    setMedicalCenter(response.data);
                } else {
                    toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت اطلاعات مرکز.'}</Notification>);
                    navigate('/medical-centers');
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
                navigate('/medical-centers');
            } finally {
                setLoading(false);
            }
        };
        fetchCenterDetails();
    }, [id, navigate]);

    const handleBack = () => {
        navigate('/medical-centers');
    };

    const handleEdit = () => {
        navigate(`/medical-centers/edit/${id}`);
    };

    if (loading) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    if (!medicalCenter) {
        return <div className="p-4 text-center">اطلاعات مرکز درمانی یافت نشد.</div>;
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <Button variant="plain" icon={<HiArrowRight />} onClick={handleBack} className="mr-2" />
                            <h4 className="text-xl font-semibold">جزئیات مرکز درمانی: {medicalCenter.name}</h4>
                        </div>
                        <Button variant="solid" icon={<HiOutlinePencil />} onClick={handleEdit}> ویرایش </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-6">
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات عمومی</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 p-2">
                                    <DetailItem label="نام مرکز" value={medicalCenter.name} />
                                    <DetailItem label="نوع مرکز" value={medicalCenter.type} />
                                    <DetailItem label="ایمیل" value={medicalCenter.email} />
                                    <DetailItem label="شماره تلفن" value={medicalCenter.phoneNumber} />
                                    <DetailItem label="وبسایت" value={medicalCenter.website} isLink={true} />
                                    <DetailItem label="ساعات کاری" value={medicalCenter.workingHours} />
                                    <DetailItem label="وضعیت" value={medicalCenter.status} />
                                    <DetailItem label="تاریخ ثبت" value={new Date(medicalCenter.created_at).toLocaleDateString('fa-IR')} />
                                </div>
                            </section>
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">خدمات ارائه شده</h5>
                                <div className="p-2">
                                    <DetailItem label="" value={medicalCenter.services} />
                                </div>
                            </section>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">آدرس</h5>
                                <div className="p-2 space-y-2">
                                    <DetailItem label="استان" value={medicalCenter.state} />
                                    <DetailItem label="شهر" value={medicalCenter.city} />
                                    <DetailItem label="شهرستان/منطقه" value={medicalCenter.county} />
                                    <DetailItem label="جزئیات آدرس" value={medicalCenter.addressDetail} />
                                </div>
                            </section>
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">اطلاعات فرد مسئول</h5>
                                <div className="p-2 space-y-2">
                                    <DetailItem label="نام و نام خانوادگی" value={medicalCenter.contactPersonName} />
                                    <DetailItem label="شماره موبایل" value={medicalCenter.contactPersonPhone} />
                                </div>
                            </section>
                            {(medicalCenter.licenseNumber || medicalCenter.licenseFile) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">مجوزها</h5>
                                    <div className="p-2 space-y-2">
                                        <DetailItem label="شماره پروانه/مجوز" value={medicalCenter.licenseNumber} />
                                        {medicalCenter.licenseFile && (
                                            <div>
                                                <p className="text-gray-500 text-sm">فایل پروانه/مجوز</p>
                                                <a href={medicalCenter.licenseFile} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                                    مشاهده فایل
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {medicalCenter.description && (
                        <section className="mt-6">
                            <h5 className="text-lg font-medium mb-3 p-2 bg-gray-50 rounded">توضیحات تکمیلی</h5>
                            <div className="p-2">
                                <p className="whitespace-pre-wrap">{medicalCenter.description}</p>
                            </div>
                        </section>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MedicalCenterDetails;