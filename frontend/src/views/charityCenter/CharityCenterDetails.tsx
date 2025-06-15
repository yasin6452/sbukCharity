import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight, HiOutlinePencil, HiOutlineGlobeAlt, HiOutlineIdentification, HiOutlineDocumentText, HiOutlineGift, HiOutlinePhone, HiOutlineMail, HiOutlineUserCircle, HiOutlineMap, HiOutlineClock, HiOutlineInformationCircle, HiOutlineNewspaper, HiOutlineCollection, HiOutlineQuestionMarkCircle } from 'react-icons/hi'
import { getCharityCenter, CharityCenter } from '@/services/data'

const DetailItem = ({ label, value, icon, isLink, isMultiLine }: { label: string, value?: string | null | number, icon?: React.ReactNode, isLink?: boolean, isMultiLine?: boolean }) => (
    value || value === 0 ? (
        <div className="flex items-start mb-4">
            {icon && <span className="ml-2 mt-1 text-gray-500">{icon}</span>}
            <div className="w-full">
                <p className="text-gray-500 text-sm">{label}</p>
                {isLink && typeof value === 'string' ? (
                    <a href={value.startsWith('http') ? value : (value.includes('@') ? `mailto:${value}`: `https://${value}`)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-words">
                        {value}
                    </a>
                ) : (
                    <p className={`font-medium ${isMultiLine ? 'whitespace-pre-wrap' : ''} break-words`}>{String(value)}</p>
                )}
            </div>
        </div>
    ) : null
);

const CharityCenterDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [charityCenter, setCharityCenter] = useState<CharityCenter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenterDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getCharityCenter(parseInt(id));
                if (response.ok && response.data) {
                    setCharityCenter(response.data);
                } else {
                    toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت اطلاعات.'}</Notification>);
                    navigate('/charity-centers');
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
                navigate('/charity-centers');
            } finally {
                setLoading(false);
            }
        };
        fetchCenterDetails();
    }, [id, navigate]);

    if (loading) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    if (!charityCenter) {
        return <div className="p-4 text-center">اطلاعات مرکز نیکوکاری یافت نشد.</div>;
    }

    const { name, type, mainActivityArea, registrationNumber, establishmentDate, missionAndGoals, phoneNumber, email, website,
            state, city, county, addressDetail, contactPersonName, contactPersonPhone, currentNeeds, donationMethods,
            charterOrLicenseFile, logo, description, status, created_at } = charityCenter;

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                 <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <Button variant="plain" icon={<HiArrowRight />} onClick={() => navigate('/charity-centers')} className="ml-2" />
                            {logo && <img src={logo} alt={`لوگو ${name}`} className="w-16 h-16 rounded-md mr-3 object-contain" />}
                            <div>
                                <h4 className="text-xl font-semibold">{name}</h4>
                                <p className="text-sm text-gray-600">{type}</p>
                            </div>
                        </div>
                        <Button variant="solid" icon={<HiOutlinePencil />} onClick={() => navigate(`/charity-centers/edit/${id}`)}>ویرایش</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4">
                        <div className="md:col-span-7 space-y-6">
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineInformationCircle className="ml-2" />درباره مرکز</h5>
                                <div className="px-2">
                                    <DetailItem label="حوزه فعالیت اصلی" value={mainActivityArea} icon={<HiOutlineGift />} />
                                    <DetailItem label="اهداف و ماموریت‌ها" value={missionAndGoals} icon={<HiOutlineNewspaper />} isMultiLine={true}/>
                                    {description && <DetailItem label="توضیحات بیشتر" value={description} icon={<HiOutlineDocumentText />} isMultiLine={true} />}
                                </div>
                            </section>
                            
                            {(currentNeeds || donationMethods) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineCollection className="ml-2" />نیازها و روش‌های کمک</h5>
                                    <div className="px-2">
                                        <DetailItem label="نیازهای فعلی مرکز" value={currentNeeds} icon={<HiOutlineQuestionMarkCircle />} isMultiLine={true}/>
                                        <DetailItem label="روش‌های کمک‌رسانی و شماره حساب" value={donationMethods} icon={<HiOutlineIdentification />} isMultiLine={true} />
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="md:col-span-5 space-y-6">
                             <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlinePhone className="ml-2" />اطلاعات تماس</h5>
                                <div className="px-2">
                                    <DetailItem label="شماره تلفن ثابت" value={phoneNumber} />
                                    <DetailItem label="ایمیل" value={email} isLink={true} icon={<HiOutlineMail />} />
                                    <DetailItem label="وبسایت" value={website} isLink={true} icon={<HiOutlineGlobeAlt />} />
                                </div>
                            </section>
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineMap className="ml-2" />آدرس</h5>
                                <div className="px-2">
                                    <DetailItem label="استان" value={state} />
                                    <DetailItem label="شهر" value={city} />
                                    <DetailItem label="شهرستان/منطقه" value={county} />
                                    <DetailItem label="آدرس دقیق" value={addressDetail} isMultiLine={true} />
                                </div>
                            </section>
                             <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineUserCircle className="ml-2" />فرد مسئول</h5>
                                <div className="px-2">
                                    <DetailItem label="نام و نام خانوادگی" value={contactPersonName} />
                                    <DetailItem label="شماره موبایل" value={contactPersonPhone} />
                                </div>
                            </section>
                            {(registrationNumber || establishmentDate || charterOrLicenseFile) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineIdentification className="ml-2" />اطلاعات رسمی</h5>
                                    <div className="px-2">
                                        <DetailItem label="شماره ثبت" value={registrationNumber} />
                                        <DetailItem label="تاریخ تاسیس" value={establishmentDate} icon={<HiOutlineClock />} />
                                        {charterOrLicenseFile && (
                                            <DetailItem label="فایل مجوز/اساسنامه" value="مشاهده فایل" isLink={true} icon={<HiOutlineDocumentText />} />
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CharityCenterDetails;