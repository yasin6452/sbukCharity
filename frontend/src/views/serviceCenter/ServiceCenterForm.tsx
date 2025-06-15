// src/views/serviceCenter/ServiceCenterForm.tsx

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
import { getServiceCenter, createServiceCenter, updateServiceCenter } from '@/services/data'

const validationSchema = z.object({
    name: z.string().min(3, { message: 'نام مرکز حداقل باید ۳ کاراکتر باشد' }),
    serviceCategory: z.string().min(1, { message: 'دسته بندی خدمات الزامی است' }),
    detailedServices: z.string().min(10, { message: 'شرح خدمات حداقل باید ۱۰ کاراکتر باشد' }),
    email: z.string().email({ message: 'ایمیل معتبر نیست' }).optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^0\d{2,3}-?\d{7,8}$/, { message: 'شماره تلفن ثابت معتبر نیست' }),
    state: z.string().min(1, { message: 'استان الزامی است' }),
    city: z.string().min(1, { message: 'شهر الزامی است' }),
    county: z.string().min(1, { message: 'شهرستان/منطقه الزامی است' }),
    addressDetail: z.string().min(5, { message: 'جزئیات آدرس الزامی است' }),
    website: z.string().url({ message: 'آدرس وبسایت معتبر نیست' }).optional().or(z.literal('')),
    workingHours: z.string().optional(),
    contactPersonName: z.string().min(3, { message: 'نام مسئول حداقل باید ۳ کاراکتر باشد' }),
    contactPersonPhone: z.string().regex(/^09\d{9}$/, { message: 'شماره موبایل مسئول معتبر نیست' }),
    licenseNumber: z.string().optional(),
    licenseFile: z.any().optional(),
    serviceArea: z.string().optional(),
    description: z.string().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const serviceCategoryOptions = [
    { value: 'تعمیرات لوازم خانگی', label: 'تعمیرات لوازم خانگی' },
    { value: 'تعمیرات موبایل و کامپیوتر', label: 'تعمیرات موبایل و کامپیوتر' },
    { value: 'خدمات نظافتی', label: 'خدمات نظافتی' },
    { value: 'خدمات حمل و نقل (باربری/اسباب کشی)', label: 'خدمات حمل و نقل' },
    { value: 'خدمات آموزشی (تدریس خصوصی/آموزشگاه)', label: 'خدمات آموزشی' },
    { value: 'خدمات ساختمانی و تاسیساتی', label: 'خدمات ساختمانی و تاسیساتی' },
    { value: 'خدمات خودرو', label: 'خدمات خودرو' },
    { value: 'خدمات چاپ و تبلیغات', label: 'خدمات چاپ و تبلیغات' },
    { value: 'خدمات مجالس و تشریفات', label: 'خدمات مجالس و تشریفات' },
    { value: 'خدمات مالی و حسابداری', label: 'خدمات مالی و حسابداری' },
    { value: 'خدمات فنی و مهندسی', label: 'خدمات فنی و مهندسی' },
    { value: 'خدمات زیبایی و سلامت (آرایشگاه/باشگاه)', label: 'خدمات زیبایی و سلامت' },
    { value: 'سایر خدمات', label: 'سایر خدمات' },
];

const ServiceCenterForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingLicenseFileUrl, setExistingLicenseFileUrl] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '', serviceCategory: '', detailedServices: '', email: '', phoneNumber: '',
            state: '', city: '', county: '', addressDetail: '',
            website: '', workingHours: '', contactPersonName: '', contactPersonPhone: '',
            licenseNumber: '', description: '', licenseFile: null, serviceArea: ''
        }
    });
    const licenseFileValue = watch('licenseFile');

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCenterData = async () => {
                setLoading(true);
                try {
                    const response = await getServiceCenter(parseInt(id));
                    if (response.ok && response.data) {
                        const center = response.data;
                        reset({
                            ...center,
                            email: center.email || '',
                            website: center.website || '',
                            workingHours: center.workingHours || '',
                            licenseNumber: center.licenseNumber || '',
                            serviceArea: center.serviceArea || '',
                            description: center.description || '',
                            licenseFile: null,
                        });
                        setExistingLicenseFileUrl(center.licenseFile);
                    } else {
                        toast.push(<Notification title="خطا" type="danger">{response.message || 'مرکز خدمات یافت نشد.'}</Notification>);
                        navigate('/service-centers');
                    }
                } catch (error) {
                    toast.push(<Notification title="خطا" type="danger">خطا در دریافت اطلاعات مرکز.</Notification>);
                    navigate('/service-centers');
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

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'licenseFile' && value instanceof FileList && value.length > 0) {
                formData.append(key, value[0]);
            } else if (value !== null && value !== undefined && !(key === 'licenseFile')) {
                formData.append(key, value as string);
            }
        });

        try {
            const response = isEditMode && id
                ? await updateServiceCenter(parseInt(id), formData)
                : await createServiceCenter(formData);

            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message}</Notification>);
                navigate('/service-centers');
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'عملیات ناموفق بود.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/service-centers');
    };

    if (loading && isEditMode) {
        return <div className="min-h-screen w-full p-4 flex justify-center items-center"><Spinner size={40} /></div>;
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-6">
                    <h4 className="text-xl font-semibold mb-6">
                        {isEditMode ? 'ویرایش اطلاعات مرکز خدمات' : 'ثبت مرکز خدمات جدید'}
                    </h4>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <h5 className="md:col-span-2 text-lg font-medium my-3 p-2 bg-gray-50 rounded">اطلاعات عمومی مرکز</h5>
                            <FormItem label="نام مرکز" invalid={!!errors.name} errorMessage={errors.name?.message}>
                                <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="مثال: خدمات فنی البرز" />} />
                            </FormItem>
                            <FormItem label="دسته بندی خدمات" invalid={!!errors.serviceCategory} errorMessage={errors.serviceCategory?.message}>
                                <Controller name="serviceCategory" control={control} render={({ field }) => (
                                    <Select options={serviceCategoryOptions} value={serviceCategoryOptions.find(opt => opt.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="انتخاب دسته بندی" />
                                )}/>
                            </FormItem>
                            <FormItem label="شرح دقیق خدمات" className="md:col-span-2" invalid={!!errors.detailedServices} errorMessage={errors.detailedServices?.message}>
                                <Controller name="detailedServices" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} placeholder="لیست دقیق خدمات قابل ارائه را وارد کنید..." />} />
                            </FormItem>
                            <FormItem label="ایمیل (اختیاری)" invalid={!!errors.email} errorMessage={errors.email?.message}>
                                <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="info@servicecenter.com" />} />
                            </FormItem>
                            <FormItem label="شماره تلفن ثابت" invalid={!!errors.phoneNumber} errorMessage={errors.phoneNumber?.message}>
                                <Controller name="phoneNumber" control={control} render={({ field }) => <Input {...field} placeholder="مثال: 02633221100" />} />
                            </FormItem>
                            <FormItem label="وبسایت (اختیاری)" invalid={!!errors.website} errorMessage={errors.website?.message}>
                                <Controller name="website" control={control} render={({ field }) => <Input {...field} placeholder="https://www.myservice.ir" />} />
                            </FormItem>
                            <FormItem label="محدوده ارائه خدمات (اختیاری)" invalid={!!errors.serviceArea} errorMessage={errors.serviceArea?.message}>
                                <Controller name="serviceArea" control={control} render={({ field }) => <Input {...field} placeholder="مثال: فقط شهر کرج، استان تهران و البرز" />} />
                            </FormItem>
                            <FormItem label="ساعات کاری (اختیاری)" className="md:col-span-2" invalid={!!errors.workingHours} errorMessage={errors.workingHours?.message}>
                                <Controller name="workingHours" control={control} render={({ field }) => <Input {...field} placeholder="مثال: همه روزه از ۸ صبح تا ۹ شب" />} />
                            </FormItem>

                            <h5 className="md:col-span-2 text-lg font-medium my-3 p-2 bg-gray-50 rounded">آدرس مرکز</h5>
                            <FormItem label="استان" invalid={!!errors.state} errorMessage={errors.state?.message}> <Controller name="state" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهر" invalid={!!errors.city} errorMessage={errors.city?.message}> <Controller name="city" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="شهرستان/منطقه" invalid={!!errors.county} errorMessage={errors.county?.message}> <Controller name="county" control={control} render={({ field }) => <Input {...field} />} /></FormItem>
                            <FormItem label="جزئیات آدرس" className="md:col-span-2" invalid={!!errors.addressDetail} errorMessage={errors.addressDetail?.message}>
                                <Controller name="addressDetail" control={control} render={({ field }) => <Input {...field} as="textarea" rows={2} />} />
                            </FormItem>

                            <h5 className="md:col-span-2 text-lg font-medium my-3 p-2 bg-gray-50 rounded">اطلاعات فرد مسئول/رابط</h5>
                            <FormItem label="نام و نام خانوادگی مسئول" invalid={!!errors.contactPersonName} errorMessage={errors.contactPersonName?.message}>
                                <Controller name="contactPersonName" control={control} render={({ field }) => <Input {...field} />} />
                            </FormItem>
                            <FormItem label="شماره موبایل مسئول" invalid={!!errors.contactPersonPhone} errorMessage={errors.contactPersonPhone?.message}>
                                <Controller name="contactPersonPhone" control={control} render={({ field }) => <Input {...field} />} />
                            </FormItem>

                            <h5 className="md:col-span-2 text-lg font-medium my-3 p-2 bg-gray-50 rounded">مجوزها و توضیحات</h5>
                            <FormItem label="شماره پروانه/مجوز (اختیاری)" invalid={!!errors.licenseNumber} errorMessage={errors.licenseNumber?.message}>
                                <Controller name="licenseNumber" control={control} render={({ field }) => <Input {...field} />} />
                            </FormItem>
                            <FormItem label="فایل پروانه/مجوز (اختیاری)" invalid={!!errors.licenseFile} errorMessage={errors.licenseFile?.message as string}>
                                <Controller name="licenseFile" control={control} render={({ field: { onChange } }) => (
                                    <Upload draggable className="border-2 border-dashed p-4 rounded-lg" onChange={(files) => onChange(files)} showList={false} accept=".pdf,.jpg,.jpeg,.png" uploadLimit={1}>
                                        <div className="text-center"> <HiOutlineUpload className="mx-auto h-10 w-10 text-gray-400" /> <p className="font-semibold"><span className="text-gray-800">فایل را بکشید یا </span><span className="text-blue-500">کلیک کنید</span></p> <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (حداکثر 5MB)</p> </div>
                                    </Upload>
                                )} />
                                {licenseFileValue instanceof FileList && licenseFileValue.length > 0 && (<div className="mt-2 text-sm text-green-600">فایل انتخاب شده: {licenseFileValue[0].name}</div>)}
                                {isEditMode && existingLicenseFileUrl && (!licenseFileValue || (licenseFileValue instanceof FileList && licenseFileValue.length === 0)) && (
                                    <div className="mt-2"><a href={existingLicenseFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">مشاهده فایل مجوز فعلی</a></div>
                                )}
                            </FormItem>
                            <FormItem label="توضیحات بیشتر (اختیاری)" className="md:col-span-2" invalid={!!errors.description} errorMessage={errors.description?.message}>
                                <Controller name="description" control={control} render={({ field }) => <Input {...field} as="textarea" rows={3} />} />
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="plain" onClick={handleCancel}> انصراف </Button>
                            <Button type="submit" variant="solid" loading={submitting} disabled={submitting}>
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت مرکز خدمات'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default ServiceCenterForm;