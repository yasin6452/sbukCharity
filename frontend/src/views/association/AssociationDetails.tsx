import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useParams, useNavigate } from 'react-router-dom'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/Button'
import { HiArrowRight, HiOutlinePencil, HiOutlineUsers, HiOutlineUserGroup, HiOutlineSparkles, HiOutlineFlag, HiOutlineCalendar, HiOutlineIdentification, HiOutlinePhone, HiOutlineMail, HiOutlineGlobeAlt, HiOutlineLocationMarker, HiOutlineUserCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineUserAdd } from 'react-icons/hi'
import { getAssociation, Association } from '@/services/data'

const DetailItem = ({ label, value, icon, isLink, isMultiLine }: { label: string, value?: string | null | number, icon?: React.ReactNode, isLink?: boolean, isMultiLine?: boolean }) => (
    value || value === 0 ? (
        <div className="flex items-start mb-4">
            {icon && <span className="ml-2 mt-1 text-gray-500 flex-shrink-0 w-5 h-5">{icon}</span>}
            <div className="flex-grow">
                <p className="text-gray-500 text-sm">{label}</p>
                {isLink && typeof value === 'string' ? (
                    <a href={value.startsWith('http') || value.startsWith('t.me') ? value : (value.includes('@') ? `mailto:${value}`: `https://${value}`)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline break-words">
                        {value}
                    </a>
                ) : (
                    <p className={`font-medium ${isMultiLine ? 'whitespace-pre-wrap' : ''} break-words`}>{String(value)}</p>
                )}
            </div>
        </div>
    ) : null
);

const AssociationDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [association, setAssociation] = useState<Association | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getAssociation(parseInt(id));
                if (response.ok && response.data) {
                    setAssociation(response.data);
                } else {
                    toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت اطلاعات.'}</Notification>);
                    navigate('/associations');
                }
            } catch (error) {
                toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
                navigate('/associations');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    if (!association) {
        return <div className="p-4 text-center">اطلاعات تشکل یافت نشد.</div>;
    }
    
    const { name, type, mainActivityArea, missionAndVision, establishmentDate, registrationNumber, contactPhoneNumber, email, websiteOrSocialPage, state, city, county, addressDetail, headPersonName, headPersonPhone, estimatedMembersCount, membershipProcess, currentNeeds, logo, description, status, created_at } = association;

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                 <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <Button variant="plain" icon={<HiArrowRight />} onClick={() => navigate('/associations')} className="ml-2" />
                            {logo && <img src={logo} alt={`لوگو ${name}`} className="w-16 h-16 rounded-lg mr-3 object-contain bg-gray-100 p-1" />}
                            <div>
                                <h4 className="text-xl font-semibold">{name}</h4>
                                <p className="text-sm text-gray-600">{type}</p>
                            </div>
                        </div>
                        <Button variant="solid" icon={<HiOutlinePencil />} onClick={() => navigate(`/associations/edit/${id}`)}>ویرایش</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4">
                        <div className="md:col-span-7 space-y-6">
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineSparkles className="ml-2" />درباره تشکل</h5>
                                <div className="px-2 pt-2">
                                    <DetailItem label="حوزه فعالیت اصلی" value={mainActivityArea} icon={<HiOutlineFlag />} />
                                    <DetailItem label="اهداف و چشم‌انداز" value={missionAndVision} icon={<HiOutlineDocumentText />} isMultiLine={true}/>
                                    {description && <DetailItem label="توضیحات بیشتر" value={description} icon={<HiOutlineInformationCircle />} isMultiLine={true} />}
                                </div>
                            </section>
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineUserGroup className="ml-2" />اعضا و عضویت</h5>
                                <div className="px-2 pt-2">
                                    <DetailItem label="تعداد اعضای تخمینی" value={estimatedMembersCount} icon={<HiOutlineUsers />} />
                                    <DetailItem label="نحوه عضویت" value={membershipProcess} icon={<HiOutlineUserAdd />} isMultiLine={true}/>
                                </div>
                            </section>
                            {currentNeeds && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineExclamationCircle className="ml-2" />نیازمندی‌های فعلی</h5>
                                    <div className="px-2 pt-2">
                                        <DetailItem label="" value={currentNeeds} isMultiLine={true}/>
                                    </div>
                                </section>
                            )}
                        </div>
                        
                        <div className="md:col-span-5 space-y-6">
                             <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlinePhone className="ml-2" />اطلاعات تماس</h5>
                                <div className="px-2 pt-2">
                                    <DetailItem label="تلفن تماس" value={contactPhoneNumber} />
                                    <DetailItem label="ایمیل" value={email} isLink={true} icon={<HiOutlineMail />} />
                                    <DetailItem label="وبسایت/صفحه اجتماعی" value={websiteOrSocialPage} isLink={true} icon={<HiOutlineGlobeAlt />} />
                                </div>
                            </section>
                            <section>
                                <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineUserCircle className="ml-2" />مسئول تشکل</h5>
                                <div className="px-2 pt-2">
                                    <DetailItem label="نام و نام خانوادگی" value={headPersonName} />
                                    <DetailItem label="موبایل مسئول" value={headPersonPhone} />
                                </div>
                            </section>
                            {(addressDetail) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineLocationMarker className="ml-2" />آدرس</h5>
                                    <div className="px-2 pt-2">
                                        <DetailItem label="استان" value={state} />
                                        <DetailItem label="شهر" value={city} />
                                        <DetailItem label="آدرس دقیق" value={addressDetail} isMultiLine={true} />
                                    </div>
                                </section>
                            )}
                             {(registrationNumber || establishmentDate) && (
                                <section>
                                    <h5 className="text-lg font-medium mb-3 p-2 bg-gray-100 rounded inline-flex items-center"><HiOutlineIdentification className="ml-2" />اطلاعات رسمی</h5>
                                    <div className="px-2 pt-2">
                                        <DetailItem label="شماره ثبت" value={registrationNumber} />
                                        <DetailItem label="تاریخ تاسیس" value={establishmentDate} icon={<HiOutlineCalendar />} />
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

export default AssociationDetails;