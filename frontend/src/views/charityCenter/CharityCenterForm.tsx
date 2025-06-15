import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { HiOutlineUpload } from 'react-icons/hi'
import { getCharityCenter, createCharityCenter, updateCharityCenter } from '@/services/data'

const validationSchema = z.object({
    name: z.string().min(3, { message: 'نام مرکز حداقل باید ۳ کاراکتر باشد' }),
    mainActivityArea: z.string().min(1, { message: 'حوزه فعالیت اصلی الزامی است' }),
    type: z.string().min(1, { message: 'نوع مرکز الزامی است' }),
    registrationNumber: z.string().optional(),
    establishmentDate: z.string().optional(),
    missionAndGoals: z.string().min(20, { message: 'اهداف و ماموریت‌ها حداقل باید ۲۰ کاراکتر باشد' }),
    email: z.string().email({ message: 'ایمیل معتبر نیست' }).optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^0\d{2,3}-?\d{7,8}$/, { message: 'شماره تلفن ثابت معتبر نیست' }),
    state: z.string().min(1, { message: 'استان الزامی است' }),
    city: z.string().min(1, { message: 'شهر الزامی است' }),
    county: z.string().min(1, { message: 'شهرستان/منطقه الزامی است' }),
    addressDetail: z.string().min(5, { message: 'جزئیات آدرس الزامی است' }),
    website: z.string().url({ message: 'آدرس وبسایت معتبر نیست' }).optional().or(z.literal('')),
    contactPersonName: z.string().min(3, { message: 'نام مسئول حداقل باید ۳ کاراکتر باشد' }),
    contactPersonPhone: z.string().regex(/^09\d{9}$/, { message: 'شماره موبایل مسئول معتبر نیست' }),
    currentNeeds: z.string().optional(),
    donationMethods: z.string().optional(),
    charterOrLicenseFile: z.any().optional(),
    logoFile: z.any().optional(),
    description: z.string().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const charityTypeOptions = [
    { value: 'موسسه خیریه رسمی', label: 'موسسه خیریه رسمی' },
    { value: 'سازمان مردم نهاد (سمن)', label: 'سازمان مردم نهاد (سمن)' },
    { value: 'گروه جهادی/مردمی', label: 'گروه جهادی/مردمی' },
    { value: 'مرکز نیکوکاری محلی', label: 'مرکز نیکوکاری محلی' },
    { value: 'وقف عام', label: 'وقف عام' },
    { value: 'سایر', label: 'سایر' },
];
const mainActivityAreaOptions = [
    { value: 'حمایت از کودکان بی سرپرست و بدسرپرست', label: 'حمایت از کودکان بی سرپرست و بدسرپرست' },
    { value: 'حمایت از زنان سرپرست خانوار', label: 'حمایت از زنان سرپرست خانوار' },
    { value: 'کمک به نیازمندان و تامین معیشت', label: 'کمک به نیازمندان و تامین معیشت' },
    { value: 'سلامت و درمان بیماران نیازمند', label: 'سلامت و درمان بیماران نیازمند' },
    { value: 'آموزش و توانمندسازی', label: 'آموزش و توانمندسازی' },
    { value: 'حفاظت از محیط زیست', label: 'حفاظت از محیط زیست' },
    { value: 'حمایت از حیوانات', label: 'حمایت از حیوانات' },
    { value: 'فعالیت های فرهنگی و مذهبی', label: 'فعالیت های فرهنگی و مذهبی' },
    { value: 'امور جوانان و ازدواج', label: 'امور جوانان و ازدواج' },
    { value: 'سایر حوزه ها', label: 'سایر حوزه ها' },
];

const CharityCenterForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingFiles, setExistingFiles] = useState<{ charter?: string | null, logo?: string | null }>({});

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '', mainActivityArea: '', type: '', registrationNumber: '', establishmentDate: '',
            missionAndGoals: '', email: '', phoneNumber: '', state: '', city: '', county: '',
            addressDetail: '', website: '', contactPersonName: '', contactPersonPhone: '',
            currentNeeds: '', donationMethods: '', description: '',
            charterOrLicenseFile: null, logoFile: null
        }
    });

    const charterFileValue = watch('charterOrLicenseFile');
    const logoFileValue = watch('logoFile');

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCenterData = async () => {
                setLoading(true);
                try {
                    const response = await getCharityCenter(parseInt(id));
                    if (response.ok && response.data) {
                        const center = response.data;
                        reset({ ...center,
                            registrationNumber: center.registrationNumber || '', establishmentDate: center.establishmentDate || '',
                            email: center.email || '', website: center.website || '',
                            currentNeeds: center.currentNeeds || '', donationMethods: center.donationMethods || '',
                            description: center.description || '',
                            charterOrLicenseFile: null, logoFile: null,
                        });
                        setExistingFiles({ charter: center.charterOrLicenseFile, logo: center.logo });
                    } else {
                        toast.push(<Notification title="خطا" type="danger">{response.message || 'مرکز یافت نشد.'}</Notification>);
                        navigate('/charity-centers');
                    }
                } catch (error) {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات مرکز.</Notification>);
                    navigate('/charity-centers');
                } finally {
                    setLoading(false);
                }
            };
            fetchCenterData();
        }
    }, [id, isEditMode, navigate, reset]);

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        const formData = new FormData();
        
        // Rename 'logoFile' to 'logo' for the backend
        if (data.logoFile instanceof FileList && data.logoFile.length > 0) {
            formData.append('logo', data.logoFile[0]);
        }
        
        (Object.keys(data) as Array<keyof FormSchema>).forEach(key => {
            if (key === 'logoFile') return; // Already handled
            const value = data[key];
            if (key === 'charterOrLicenseFile') {
                if (value instanceof FileList && value.length > 0) formData.append(key, value[0]);
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        try {
            const response = isEditMode && id 
                ? await updateCharityCenter(parseInt(id), formData) 
                : await createCharityCenter(formData);

            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message}</Notification>);
                navigate('/charity-centers');
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'عملیات ناموفق بود.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
        } finally {
            setSubmitting(false);
        }
    };
    
    const FilePreview = ({ fileWatch, existingUrl, label }: { fileWatch: any, existingUrl?: string | null, label: string }) => {
        if (fileWatch instanceof FileList && fileWatch.length > 0) {
            return <div className="mt-2 text-sm text-green-600">{label} انتخاب شده: {fileWatch[0].name}</div>;
        }
        if (isEditMode && existingUrl) {
            return <div className="mt-2"><a href={existingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">مشاهده {label} فعلی</a></div>;
        }
        return null;
    };

    if (loading && isEditMode) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-6">
                    <h4 className="text-xl font-semibold mb-6">{isEditMode ? 'ویرایش مرکز نیکوکاری' : 'ثبت مرکز نیکوکاری جدید'}</h4>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="text-lg font-medium mt-4 mb-3 p-2 bg-gray-50 rounded">اطلاعات عمومی و هویتی</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام مرکز/موسسه" invalid={!!errors.name} errorMessage={errors.name?.message} className="md:col-span-2">
                                <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
                            </FormItem>
                            <FormItem label="نوع مرکز" invalid={!!errors.type} errorMessage={errors.type?.message}>
                                <Controller name="type" control={control} render={({ field }) => (
                                    <Select options={charityTypeOptions} value={charityTypeOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب نوع" />
                                )}/>
                            </FormItem>
                            <FormItem label="حوزه فعالیت اصلی" invalid={!!errors.mainActivityArea} errorMessage={errors.mainActivityArea?.message}>
                                <Controller name="mainActivityArea" control={control} render={({ field }) => (
                                    <Select isClearable options={mainActivityAreaOptions} value={mainActivityAreaOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب حوزه فعالیت" />
                                )}/>
                            </FormItem>
                            <FormItem label="شماره ثبت (اختیاری)" invalid={!!errors.registrationNumber} errorMessage={errors.registrationNumber?.message}>
                                <Controller name="registrationNumber" control={control} render={({ field }) => <Input {...field} />} />
                            </FormItem>
                             <FormItem label="تاریخ تاسیس (اختیاری)" invalid={!!errors.establishmentDate} errorMessage={errors.establishmentDate?.message}>
                                <Controller name="establishmentDate" control={control} render={({ field }) => <Input {...field} type="text" placeholder="مثال: ۱۳۷۵/۰۲/۱۵" />} />
                            </FormItem>
                             <FormItem label="اهداف و ماموریت‌ها" className="md:col-span-2" invalid={!!errors.missionAndGoals} errorMessage={errors.missionAndGoals?.message}>
                                <Controller name="missionAndGoals" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} />
                            </FormItem>
                        </div>

                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس و آدرس</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="شماره تلفن ثابت" invalid={!!errors.phoneNumber} errorMessage={errors.phoneNumber?.message}><Controller name="phoneNumber" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="ایمیل (اختیاری)" invalid={!!errors.email} errorMessage={errors.email?.message}><Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" />} /></FormItem>
                            <FormItem label="وبسایت (اختیاری)" className="md:col-span-2" invalid={!!errors.website} errorMessage={errors.website?.message}><Controller name="website" control={control} render={({ field }) => <Input {...field} placeholder="https://charity.org" />} /></FormItem>
                            <FormItem label="استان" invalid={!!errors.state} errorMessage={errors.state?.message}><Controller name="state" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهر" invalid={!!errors.city} errorMessage={errors.city?.message}><Controller name="city" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهرستان/منطقه" invalid={!!errors.county} errorMessage={errors.county?.message}><Controller name="county" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="جزئیات آدرس" className="md:col-span-2" invalid={!!errors.addressDetail} errorMessage={errors.addressDetail?.message}><Controller name="addressDetail" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} /></FormItem>
                        </div>
                        
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات فرد مسئول/رابط</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام مسئول" invalid={!!errors.contactPersonName} errorMessage={errors.contactPersonName?.message}><Controller name="contactPersonName" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="موبایل مسئول" invalid={!!errors.contactPersonPhone} errorMessage={errors.contactPersonPhone?.message}><Controller name="contactPersonPhone" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                        </div>

                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">نیازها و روش‌های کمک‌رسانی (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نیازهای فعلی" invalid={!!errors.currentNeeds} errorMessage={errors.currentNeeds?.message}><Controller name="currentNeeds" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} placeholder="مثال: پوشاک گرم، لوازم التحریر..." />} /></FormItem>
                            <FormItem label="روش‌های کمک‌رسانی" invalid={!!errors.donationMethods} errorMessage={errors.donationMethods?.message}><Controller name="donationMethods" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} placeholder="شماره حساب/کارت، لینک درگاه پرداخت..." />} /></FormItem>
                        </div>

                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">فایل‌ها و توضیحات (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="فایل مجوز/اساسنامه" invalid={!!errors.charterOrLicenseFile} errorMessage={errors.charterOrLicenseFile?.message as string}>
                                 <Controller name="charterOrLicenseFile" control={control} render={({ field: { onChange } }) => (
                                    <Upload draggable className="border-2 border-dashed p-4 rounded-lg" onChange={files => onChange(files)} showList={false} accept=".pdf,.doc,.docx,.jpg,.png" uploadLimit={1}><div className="text-center"><HiOutlineUpload className="mx-auto h-10 w-10 text-gray-400" /><p className="font-semibold">فایل را بکشید یا کلیک کنید</p><p className="mt-1 text-xs text-gray-500">PDF, Word, Image</p></div></Upload>
                                )}/>
                                <FilePreview fileWatch={charterFileValue} existingUrl={existingFiles.charter} label="فایل مجوز" />
                            </FormItem>
                            <FormItem label="لوگو مرکز" invalid={!!errors.logoFile} errorMessage={errors.logoFile?.message as string}>
                                <Controller name="logoFile" control={control} render={({ field: { onChange } }) => (
                                    <Upload draggable className="border-2 border-dashed p-4 rounded-lg" onChange={files => onChange(files)} showList={false} accept=".jpg,.jpeg,.png,.svg" uploadLimit={1}><div className="text-center"><HiOutlineUpload className="mx-auto h-10 w-10 text-gray-400" /><p className="font-semibold">فایل را بکشید یا کلیک کنید</p><p className="mt-1 text-xs text-gray-500">JPG, PNG, SVG</p></div></Upload>
                                )}/>
                                <FilePreview fileWatch={logoFileValue} existingUrl={existingFiles.logo} label="لوگو" />
                            </FormItem>
                            <FormItem label="توضیحات بیشتر" className="md:col-span-2" invalid={!!errors.description} errorMessage={errors.description?.message}><Controller name="description" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} /></FormItem>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="plain" onClick={() => navigate('/charity-centers')}>انصراف</Button>
                            <Button type="submit" variant="solid" loading={submitting} disabled={submitting}>{isEditMode ? 'بروزرسانی' : 'ثبت مرکز'}</Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default CharityCenterForm;