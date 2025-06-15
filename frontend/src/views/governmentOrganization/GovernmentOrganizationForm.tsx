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
import { getGovernmentOrganization, createGovernmentOrganization, updateGovernmentOrganization } from '@/services/data'

const validationSchema = z.object({
    name: z.string().min(3, { message: 'نام سازمان حداقل باید ۳ کاراکتر باشد' }),
    parentMinistryOrBody: z.string().optional(),
    type: z.string().min(1, { message: 'نوع سازمان الزامی است' }),
    activityArea: z.string().min(1, { message: 'حوزه فعالیت الزامی است' }),
    officialWebsite: z.string().url({ message: 'آدرس وبسایت معتبر نیست' }),
    mainPhoneNumber: z.string().regex(/^0\d{2,3}-?\d{7,8}$/, { message: 'شماره تلفن ثابت معتبر نیست' }),
    faxNumber: z.string().regex(/^0\d{2,3}-?\d{7,8}$/, { message: 'شماره فکس معتبر نیست' }).optional().or(z.literal('')),
    officialEmail: z.string().email({ message: 'ایمیل رسمی معتبر نیست' }).optional().or(z.literal('')),
    state: z.string().min(1, { message: 'استان الزامی است' }),
    city: z.string().min(1, { message: 'شهر الزامی است' }),
    county: z.string().min(1, { message: 'شهرستان/منطقه الزامی است' }),
    centralAddressDetail: z.string().min(5, { message: 'جزئیات آدرس الزامی است' }),
    headPersonName: z.string().min(3, { message: 'نام مدیر سازمان حداقل باید ۳ کاراکتر باشد' }),
    liaisonPersonName: z.string().optional(),
    liaisonPersonPhone: z.string().regex(/^09\d{9}$/, { message: 'شماره موبایل رابط معتبر نیست' }).optional().or(z.literal('')),
    liaisonPersonEmail: z.string().email({ message: 'ایمیل رابط معتبر نیست' }).optional().or(z.literal('')),
    collaborationLevel: z.string().optional(),
    description: z.string().optional(),
    logoFile: z.any().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const organizationTypeOptions = [
    { value: 'وزارتخانه', label: 'وزارتخانه' }, { value: 'سازمان تابعه', label: 'سازمان تابعه' },
    { value: 'شرکت دولتی', label: 'شرکت دولتی' }, { value: 'اداره کل استانی/شهرستانی', label: 'اداره کل استانی/شهرستانی' },
    { value: 'نهاد عمومی غیردولتی', label: 'نهاد عمومی غیردولتی' }, { value: 'دانشگاه/مرکز تحقیقاتی دولتی', label: 'دانشگاه/مرکز تحقیقاتی دولتی' },
    { value: 'سایر', label: 'سایر' },
];
const activityAreaOptions = [
    { value: 'بهداشت، درمان و آموزش پزشکی', label: 'بهداشت، درمان و آموزش پزشکی' }, { value: 'آموزش و پرورش و آموزش عالی', label: 'آموزش و پرورش و آموزش عالی' },
    { value: 'صنعت، معدن و تجارت', label: 'صنعت، معدن و تجارت' }, { value: 'کشاورزی و منابع طبیعی', label: 'کشاورزی و منابع طبیعی' },
    { value: 'راه و شهرسازی و حمل و نقل', label: 'راه و شهرسازی و حمل و نقل' }, { value: 'امور اقتصادی و دارایی', label: 'امور اقتصادی و دارایی' },
    { value: 'فرهنگ، هنر و ارشاد اسلامی', label: 'فرهنگ، هنر و ارشاد اسلامی' }, { value: 'ورزش و جوانان', label: 'ورزش و جوانان' },
    { value: 'کار، تعاون و رفاه اجتماعی', label: 'کار، تعاون و رفاه اجتماعی' }, { value: 'انرژی (نفت، گاز، برق)', label: 'انرژی (نفت، گاز، برق)' },
    { value: 'ارتباطات و فناوری اطلاعات', label: 'ارتباطات و فناوری اطلاعات' }, { value: 'امور قضایی و حقوقی', label: 'امور قضایی و حقوقی' },
    { value: 'امور دفاعی و امنیتی', label: 'امور دفاعی و امنیتی' }, { value: 'محیط زیست', label: 'محیط زیست' },
    { value: 'سایر', label: 'سایر' },
];

const GovernmentOrganizationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '', parentMinistryOrBody: '', type: '', activityArea: '', officialWebsite: '', mainPhoneNumber: '',
            faxNumber: '', officialEmail: '', state: '', city: '', county: '', centralAddressDetail: '',
            headPersonName: '', liaisonPersonName: '', liaisonPersonPhone: '', liaisonPersonEmail: '',
            collaborationLevel: '', description: '', logoFile: null
        }
    });
    const logoFileValue = watch('logoFile');

    useEffect(() => {
        if (isEditMode && id) {
            const fetchOrganizationData = async () => {
                setLoading(true);
                try {
                    const response = await getGovernmentOrganization(parseInt(id));
                    if (response.ok && response.data) {
                        const org = response.data;
                        reset({ ...org, 
                            parentMinistryOrBody: org.parentMinistryOrBody || '', faxNumber: org.faxNumber || '', officialEmail: org.officialEmail || '',
                            liaisonPersonName: org.liaisonPersonName || '', liaisonPersonPhone: org.liaisonPersonPhone || '',
                            liaisonPersonEmail: org.liaisonPersonEmail || '', collaborationLevel: org.collaborationLevel || '',
                            description: org.description || '', logoFile: null,
                        });
                        setExistingLogoUrl(org.logo);
                    } else {
                        toast.push(<Notification title="خطا" type="danger">{response.message || 'سازمان یافت نشد.'}</Notification>);
                        navigate('/government-organizations');
                    }
                } catch (error) {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات.</Notification>);
                    navigate('/government-organizations');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrganizationData();
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
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, String(value));
            }
        });

        try {
            const response = isEditMode && id 
                ? await updateGovernmentOrganization(parseInt(id), formData) 
                : await createGovernmentOrganization(formData);

            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message}</Notification>);
                navigate('/government-organizations');
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
                    <h4 className="text-xl font-semibold mb-6">{isEditMode ? 'ویرایش سازمان دولتی' : 'ثبت سازمان دولتی جدید'}</h4>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <h5 className="text-lg font-medium mt-4 mb-3 p-2 bg-gray-50 rounded">اطلاعات اصلی سازمان</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام سازمان" invalid={!!errors.name} errorMessage={errors.name?.message} className="md:col-span-2"><Controller name="name" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="وزارتخانه/نهاد بالادستی (اختیاری)" invalid={!!errors.parentMinistryOrBody} errorMessage={errors.parentMinistryOrBody?.message}><Controller name="parentMinistryOrBody" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="نوع سازمان" invalid={!!errors.type} errorMessage={errors.type?.message}><Controller name="type" control={control} render={({ field }) => (<Select options={organizationTypeOptions} value={organizationTypeOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب نوع" /> )}/></FormItem>
                            <FormItem label="حوزه فعالیت" invalid={!!errors.activityArea} errorMessage={errors.activityArea?.message} className="md:col-span-2"><Controller name="activityArea" control={control} render={({ field }) => (<Select options={activityAreaOptions} value={activityAreaOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب حوزه فعالیت" /> )}/></FormItem>
                            <FormItem label="نام مدیر/رئیس سازمان" invalid={!!errors.headPersonName} errorMessage={errors.headPersonName?.message} className="md:col-span-2"><Controller name="headPersonName" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات تماس و وبسایت</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="شماره تلفن اصلی" invalid={!!errors.mainPhoneNumber} errorMessage={errors.mainPhoneNumber?.message}><Controller name="mainPhoneNumber" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شماره فکس (اختیاری)" invalid={!!errors.faxNumber} errorMessage={errors.faxNumber?.message}><Controller name="faxNumber" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="ایمیل رسمی (اختیاری)" invalid={!!errors.officialEmail} errorMessage={errors.officialEmail?.message}><Controller name="officialEmail" control={control} render={({ field }) => <Input {...field} type="email" />} /></FormItem>
                            <FormItem label="وبسایت رسمی" invalid={!!errors.officialWebsite} errorMessage={errors.officialWebsite?.message}><Controller name="officialWebsite" control={control} render={({ field }) => <Input {...field} placeholder="https://example.gov.ir" />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">آدرس مرکزی</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                            <FormItem label="استان" invalid={!!errors.state} errorMessage={errors.state?.message}><Controller name="state" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهر" invalid={!!errors.city} errorMessage={errors.city?.message}><Controller name="city" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهرستان/منطقه" invalid={!!errors.county} errorMessage={errors.county?.message}><Controller name="county" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="جزئیات آدرس" className="md:col-span-3" invalid={!!errors.centralAddressDetail} errorMessage={errors.centralAddressDetail?.message}><Controller name="centralAddressDetail" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">اطلاعات رابط (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="نام رابط" invalid={!!errors.liaisonPersonName} errorMessage={errors.liaisonPersonName?.message}><Controller name="liaisonPersonName" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="موبایل رابط" invalid={!!errors.liaisonPersonPhone} errorMessage={errors.liaisonPersonPhone?.message}><Controller name="liaisonPersonPhone" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="ایمیل رابط" className="md:col-span-2" invalid={!!errors.liaisonPersonEmail} errorMessage={errors.liaisonPersonEmail?.message}><Controller name="liaisonPersonEmail" control={control} render={({ field }) => <Input {...field} type="email" />} /></FormItem>
                        </div>
                        <h5 className="text-lg font-medium mt-6 mb-3 p-2 bg-gray-50 rounded">سایر اطلاعات (اختیاری)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <FormItem label="سطح همکاری" invalid={!!errors.collaborationLevel} errorMessage={errors.collaborationLevel?.message}><Controller name="collaborationLevel" control={control} render={({ field }) => <Input {...field} placeholder="مثال: تفاهم نامه، پروژه مشترک" />} /></FormItem>
                            <FormItem label="لوگو سازمان" invalid={!!errors.logoFile} errorMessage={errors.logoFile?.message as string}>
                                <Controller name="logoFile" control={control} render={({ field: { onChange } }) => (
                                    <Upload draggable className="border-2 border-dashed p-4 rounded-lg" onChange={(files) => onChange(files)} showList={false} accept=".jpg,.jpeg,.png,.svg" uploadLimit={1}><div className="text-center"><HiOutlineUpload className="mx-auto h-10 w-10 text-gray-400" /><p className="font-semibold">فایل را بکشید یا کلیک کنید</p><p className="mt-1 text-xs text-gray-500">JPG, PNG, SVG</p></div></Upload>
                                )} />
                                {logoFileValue instanceof FileList && logoFileValue.length > 0 && (<div className="mt-2 text-sm text-green-600">فایل انتخاب شده: {logoFileValue[0].name}</div>)}
                                {isEditMode && existingLogoUrl && (!logoFileValue || (logoFileValue instanceof FileList && logoFileValue.length === 0)) && (<div className="mt-2"><a href={existingLogoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">مشاهده لوگوی فعلی</a></div>)}
                            </FormItem>
                            <FormItem label="شرح مختصر" className="md:col-span-2" invalid={!!errors.description} errorMessage={errors.description?.message}><Controller name="description" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} /></FormItem>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="plain" onClick={() => navigate('/government-organizations')}>انصراف</Button>
                            <Button type="submit" variant="solid" loading={submitting} disabled={submitting}>{isEditMode ? 'بروزرسانی' : 'ثبت سازمان'}</Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default GovernmentOrganizationForm;