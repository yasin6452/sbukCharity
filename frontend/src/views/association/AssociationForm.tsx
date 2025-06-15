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
import { getAssociation, createAssociation, updateAssociation } from '@/services/data'

const validationSchema = z.object({
    name: z.string().min(3, { message: 'نام تشکل حداقل باید ۳ کاراکتر باشد' }),
    type: z.string().min(1, { message: 'نوع تشکل الزامی است' }),
    mainActivityArea: z.string().min(1, { message: 'حوزه فعالیت اصلی الزامی است' }),
    missionAndVision: z.string().min(20, { message: 'اهداف و چشم‌انداز حداقل باید ۲۰ کاراکتر باشد' }),
    establishmentDate: z.string().optional(),
    registrationNumber: z.string().optional(),
    contactPhoneNumber: z.string().regex(/^0\d{2,3}-?\d{7,8}$/, { message: 'شماره تلفن معتبر نیست' }),
    email: z.string().email({ message: 'ایمیل معتبر نیست' }).optional().or(z.literal('')),
    websiteOrSocialPage: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    addressDetail: z.string().optional(),
    headPersonName: z.string().min(3, { message: 'نام مسئول حداقل باید ۳ کاراکتر باشد' }),
    headPersonPhone: z.string().regex(/^09\d{9}$/, { message: 'شماره موبایل مسئول معتبر نیست' }),
    estimatedMembersCount: z.string().regex(/^\d*$/, {message: "فقط عدد وارد کنید"}).optional().or(z.literal('')),
    membershipProcess: z.string().optional(),
    currentNeeds: z.string().optional(),
    logoFile: z.any().optional(),
    description: z.string().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const associationTypeOptions = [
    { value: 'انجمن علمی/دانشجویی', label: 'انجمن علمی/دانشجویی' },
    { value: 'کانون فرهنگی/هنری', label: 'کانون فرهنگی/هنری' },
    { value: 'گروه جهادی/مردمی', label: 'گروه جهادی/مردمی' },
    { value: 'خیریه محلی/موسسه نیکوکاری', label: 'خیریه محلی/موسسه نیکوکاری' },
    { value: 'هیئت مذهبی/تشکل دینی', label: 'هیئت مذهبی/تشکل دینی' },
    { value: 'انجمن ورزشی', label: 'انجمن ورزشی' },
    { value: 'گروه حمایت از محیط زیست/حیوانات', label: 'گروه حمایت از محیط زیست/حیوانات' },
    { value: 'سازمان مردم نهاد (سمن) رسمی', label: 'سازمان مردم نهاد (سمن) رسمی' },
    { value: 'سایر تشکل های اجتماعی', label: 'سایر تشکل های اجتماعی' },
];
const mainActivityAreaOptionsForAssoc = [
    { value: 'علمی و پژوهشی', label: 'علمی و پژوهشی' },
    { value: 'فرهنگی و هنری', label: 'فرهنگی و هنری' },
    { value: 'اجتماعی و خدمت رسانی', label: 'اجتماعی و خدمت رسانی' },
    { value: 'دینی و مذهبی', label: 'دینی و مذهبی' },
    { value: 'ورزشی و تفریحی', label: 'ورزشی و تفریحی' },
    { value: 'محیط زیست و منابع طبیعی', label: 'محیط زیست و منابع طبیعی' },
    { value: 'حقوقی و شهروندی', label: 'حقوقی و شهروندی' },
    { value: 'کارآفرینی و اشتغال', label: 'کارآفرینی و اشتغال' },
    { value: 'سلامت و بهداشت عمومی', label: 'سلامت و بهداشت عمومی' },
    { value: 'امور بین الملل', label: 'امور بین الملل' },
    { value: 'سایر', label: 'سایر' },
];

const AssociationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '', type: '', mainActivityArea: '', missionAndVision: '', establishmentDate: '',
            registrationNumber: '', contactPhoneNumber: '', email: '', websiteOrSocialPage: '',
            state: '', city: '', county: '', addressDetail: '', headPersonName: '',
            headPersonPhone: '', estimatedMembersCount: '', membershipProcess: '', currentNeeds: '',
            description: '', logoFile: null
        }
    });
    const logoFileValue = watch('logoFile');

    useEffect(() => {
        if (isEditMode && id) {
            const fetchAssociationData = async () => {
                setLoading(true);
                try {
                    const response = await getAssociation(parseInt(id));
                    if (response.ok && response.data) {
                        const assoc = response.data;
                        reset({ ...assoc,
                            establishmentDate: assoc.establishmentDate || '', registrationNumber: assoc.registrationNumber || '',
                            email: assoc.email || '', websiteOrSocialPage: assoc.websiteOrSocialPage || '',
                            state: assoc.state || '', city: assoc.city || '', county: assoc.county || '',
                            addressDetail: assoc.addressDetail || '', estimatedMembersCount: assoc.estimatedMembersCount?.toString() || '',
                            membershipProcess: assoc.membershipProcess || '', currentNeeds: assoc.currentNeeds || '',
                            description: assoc.description || '', logoFile: null,
                        });
                        setExistingLogoUrl(assoc.logo);
                    } else {
                        toast.push(<Notification title="خطا" type="danger">{response.message || 'تشکل یافت نشد.'}</Notification>);
                        navigate('/associations');
                    }
                } catch (error) {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات تشکل.</Notification>);
                    navigate('/associations');
                } finally {
                    setLoading(false);
                }
            };
            fetchAssociationData();
        }
    }, [id, isEditMode, navigate, reset]);

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        const formData = new FormData();
        
        if (data.logoFile instanceof FileList && data.logoFile.length > 0) {
            formData.append('logo', data.logoFile[0]);
        }
        
        (Object.keys(data) as Array<keyof FormSchema>).forEach(key => {
            if (key === 'logoFile') return;
            const value = data[key];
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, String(value));
            }
        });

        try {
            const response = isEditMode && id 
                ? await updateAssociation(parseInt(id), formData) 
                : await createAssociation(formData);

            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message}</Notification>);
                navigate('/associations');
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'عملیات ناموفق بود.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-6">
                    <h4 className="text-xl font-semibold mb-6">{isEditMode ? 'ویرایش اطلاعات تشکل' : 'ثبت تشکل جدید'}</h4>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="text-lg font-medium mt-4 mb-3 p-2 bg-gray-50 rounded">اطلاعات اصلی تشکل</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام تشکل" invalid={!!errors.name} errorMessage={errors.name?.message} className="md:col-span-2"><Controller name="name" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="نوع تشکل" invalid={!!errors.type} errorMessage={errors.type?.message}><Controller name="type" control={control} render={({ field }) => (<Select options={associationTypeOptions} value={associationTypeOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب نوع" />)}/></FormItem>
                            <FormItem label="حوزه فعالیت اصلی" invalid={!!errors.mainActivityArea} errorMessage={errors.mainActivityArea?.message}><Controller name="mainActivityArea" control={control} render={({ field }) => (<Select options={mainActivityAreaOptionsForAssoc} value={mainActivityAreaOptionsForAssoc.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب حوزه" />)}/></FormItem>
                            <FormItem label="اهداف و چشم‌انداز" className="md:col-span-2" invalid={!!errors.missionAndVision} errorMessage={errors.missionAndVision?.message}><Controller name="missionAndVision" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} /></FormItem>
                            <FormItem label="تاریخ تاسیس (اختیاری)" invalid={!!errors.establishmentDate} errorMessage={errors.establishmentDate?.message}><Controller name="establishmentDate" control={control} render={({ field }) => <Input {...field} placeholder="مثال: ۱۳۹۰/۰۱/۲۰" />} /></FormItem>
                            <FormItem label="شماره ثبت (اختیاری)" invalid={!!errors.registrationNumber} errorMessage={errors.registrationNumber?.message}><Controller name="registrationNumber" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="شماره تلفن تماس" invalid={!!errors.contactPhoneNumber} errorMessage={errors.contactPhoneNumber?.message}><Controller name="contactPhoneNumber" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="ایمیل (اختیاری)" invalid={!!errors.email} errorMessage={errors.email?.message}><Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" />} /></FormItem>
                            <FormItem label="وبسایت/صفحه اجتماعی (اختیاری)" className="md:col-span-2" invalid={!!errors.websiteOrSocialPage} errorMessage={errors.websiteOrSocialPage?.message}><Controller name="websiteOrSocialPage" control={control} render={({ field }) => <Input {...field} placeholder="لینک معتبر" />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">آدرس (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                            <FormItem label="استان" invalid={!!errors.state} errorMessage={errors.state?.message}><Controller name="state" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهر" invalid={!!errors.city} errorMessage={errors.city?.message}><Controller name="city" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="منطقه" invalid={!!errors.county} errorMessage={errors.county?.message}><Controller name="county" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="جزئیات آدرس" className="md:col-span-3" invalid={!!errors.addressDetail} errorMessage={errors.addressDetail?.message}><Controller name="addressDetail" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات مسئول تشکل</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام مسئول" invalid={!!errors.headPersonName} errorMessage={errors.headPersonName?.message}><Controller name="headPersonName" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="موبایل مسئول" invalid={!!errors.headPersonPhone} errorMessage={errors.headPersonPhone?.message}><Controller name="headPersonPhone" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">سایر اطلاعات (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="تعداد اعضای تخمینی" invalid={!!errors.estimatedMembersCount} errorMessage={errors.estimatedMembersCount?.message}><Controller name="estimatedMembersCount" control={control} render={({ field }) => <Input {...field} type="text" inputMode="numeric" />} /></FormItem>
                            <FormItem label="لوگو تشکل" invalid={!!errors.logoFile} errorMessage={errors.logoFile?.message as string}>
                                <Controller name="logoFile" control={control} render={({ field: { onChange } }) => (<Upload draggable className="border-2 border-dashed p-4 rounded-lg" onChange={(files) => onChange(files)} showList={false} accept=".jpg,.jpeg,.png,.svg" uploadLimit={1}><div className="text-center"><HiOutlineUpload className="mx-auto h-10 w-10 text-gray-400" /><p className="font-semibold">فایل را بکشید یا کلیک کنید</p><p className="mt-1 text-xs text-gray-500">JPG, PNG, SVG</p></div></Upload> )}/>
                                {logoFileValue instanceof FileList && logoFileValue.length > 0 && (<div className="mt-2 text-sm text-green-600">فایل: {logoFileValue[0].name}</div>)}
                                {isEditMode && existingLogoUrl && (!logoFileValue || (logoFileValue instanceof FileList && logoFileValue.length === 0)) && (<div className="mt-2"><a href={existingLogoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">مشاهده لوگوی فعلی</a></div>)}
                            </FormItem>
                            <FormItem label="نحوه عضویت" className="md:col-span-2" invalid={!!errors.membershipProcess} errorMessage={errors.membershipProcess?.message}><Controller name="membershipProcess" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} /></FormItem>
                            <FormItem label="نیازمندی‌های فعلی" className="md:col-span-2" invalid={!!errors.currentNeeds} errorMessage={errors.currentNeeds?.message}><Controller name="currentNeeds" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} /></FormItem>
                            <FormItem label="توضیحات تکمیلی" className="md:col-span-2" invalid={!!errors.description} errorMessage={errors.description?.message}><Controller name="description" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} /></FormItem>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="plain" onClick={() => navigate('/associations')}>انصراف</Button>
                            <Button type="submit" variant="solid" loading={submitting} disabled={submitting}>{isEditMode ? 'بروزرسانی' : 'ثبت تشکل'}</Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default AssociationForm;