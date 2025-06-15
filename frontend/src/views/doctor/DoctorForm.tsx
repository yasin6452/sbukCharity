import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DoctorFormData, createDoctor, updateDoctor, getDoctor } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'

// اسکیمای اعتبارسنجی فرم
const validationSchema = z.object({
    // اطلاعات کاربر
    first_name: z.string().min(1, { message: 'نام الزامی است' }),
    last_name: z.string().min(1, { message: 'نام خانوادگی الزامی است' }),
    phone_number: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    gender: z.string().min(1, { message: 'جنسیت الزامی است' }),
    state: z.string().min(1, { message: 'استان الزامی است' }),
    city: z.string().min(1, { message: 'شهر الزامی است' }),
    county: z.string().min(1, { message: 'شهرستان الزامی است' }),
    homeAddress: z.string().min(1, { message: 'آدرس منزل الزامی است' }),
    howKnow: z.string().min(1, { message: 'نحوه آشنایی الزامی است' }),
    education: z.string().min(1, { message: 'تحصیلات الزامی است' }),
    userType: z.string().min(1, { message: 'نوع کاربر الزامی است' }),
    
    // اطلاعات پزشک
    national_code: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
    fatherName: z.string().min(1, { message: 'نام پدر الزامی است' }),
    medicalCode: z.number().min(1, { message: 'کد نظام پزشکی الزامی است' }),
    secPhoneNumber: z.string().regex(/^\d{8,15}$/, { message: 'شماره تلفن باید بین 8 تا 15 رقم باشد' }),
    specialty: z.string().min(1, { message: 'تخصص الزامی است' }),
    services: z.string().min(1, { message: 'خدمات الزامی است' }),
    collabType: z.string().min(1, { message: 'نوع همکاری الزامی است' }),
    contribution: z.string().min(1, { message: 'شرح همکاری الزامی است' }),
});

type FormSchema = z.infer<typeof validationSchema>;

const DoctorForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            // اطلاعات کاربر
            first_name: '',
            last_name: '',
            phone_number: '',
            gender: '',
            state: '',
            city: '',
            county: '',
            homeAddress: '',
            howKnow: '',
            education: '',
            userType: 'پزشک',

            // اطلاعات پزشک
            national_code: '',
            fatherName: '',
            medicalCode: 0,
            secPhoneNumber: '',
            specialty: '',
            services: '',
            collabType: '',
            contribution: '',
        }
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchDoctor = async () => {
                setLoading(true);
                try {
                    const response = await getDoctor(parseInt(id));
                    if (response.ok && response.data) {
                        // پر کردن فرم با اطلاعات پزشک و کاربر
                        reset({
                            // اطلاعات کاربر 
                            first_name: response.data.user?.first_name || '',
                            last_name: response.data.user?.last_name || '',
                            phone_number: response.data.user?.phone_number || '',
                            gender: response.data.user?.gender || '',
                            state: response.data.user?.state || '',
                            city: response.data.user?.city || '',
                            county: response.data.user?.county || '',
                            homeAddress: response.data.user?.homeAddress || '',
                            howKnow: response.data.user?.howKnow || '',
                            education: response.data.user?.education || '',
                            userType: response.data.user?.userType || 'پزشک',
                            
                            // اطلاعات پزشک
                            national_code: response.data.user?.national_code || '',
                            fatherName: response.data.fatherName,
                            medicalCode: response.data.medicalCode,
                            secPhoneNumber: response.data.secPhoneNumber,
                            specialty: response.data.specialty,
                            services: response.data.services,
                            collabType: response.data.collabType,
                            contribution: response.data.contribution,
                        });
                    } else {
                        toast.push(
                            <Notification title="خطا" type="danger">
                                خطا در دریافت اطلاعات پزشک
                            </Notification>
                        );
                        navigate('/doctors');
                    }
                } catch (error) {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در ارتباط با سرور
                        </Notification>
                    );
                    navigate('/doctors');
                } finally {
                    setLoading(false);
                }
            };

            fetchDoctor();
        }
    }, [isEditMode, id, reset, navigate]);

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        try {
            const formData = { ...data };

            let response;
            if (isEditMode && id) {
                response = await updateDoctor(parseInt(id), formData);
            } else {
                response = await createDoctor(formData);
            }

            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        {isEditMode ? 'اطلاعات پزشک با موفقیت بروزرسانی شد' : 'پزشک جدید با موفقیت ثبت شد'}
                    </Notification>
                );
                navigate('/doctors');
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || (isEditMode ? 'خطا در بروزرسانی اطلاعات پزشک' : 'خطا در ثبت پزشک جدید')}
                    </Notification>
                );
            }
        } catch (error) {
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/doctors');
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full p-4 flex justify-center items-center">
                <Spinner size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4">
                        {isEditMode ? 'ویرایش اطلاعات پزشک' : 'ثبت پزشک جدید'}
                    </h4>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* اطلاعات پایه کاربر */}
                            <div className="col-span-full mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات پایه کاربر</h5>
                            </div>

                            <FormItem
                                label="نام"
                                invalid={Boolean(errors.first_name)}
                                errorMessage={errors.first_name?.message}
                            >
                                <Controller
                                    name="first_name"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام خانوادگی"
                                invalid={Boolean(errors.last_name)}
                                errorMessage={errors.last_name?.message}
                            >
                                <Controller
                                    name="last_name"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام خانوادگی" />}
                                />
                            </FormItem>

                            <FormItem
                                label="کد ملی"
                                invalid={Boolean(errors.national_code)}
                                errorMessage={errors.national_code?.message}
                            >
                                <Controller
                                    name="national_code"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="کد ملی پزشک" disabled={isEditMode} />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره موبایل"
                                invalid={Boolean(errors.phone_number)}
                                errorMessage={errors.phone_number?.message}
                            >
                                <Controller
                                    name="phone_number"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره موبایل" />}
                                />
                            </FormItem>

                            <FormItem
                                label="جنسیت"
                                invalid={Boolean(errors.gender)}
                                errorMessage={errors.gender?.message}
                            >
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'مرد', label: 'مرد' },
                                                { value: 'زن', label: 'زن' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="انتخاب جنسیت"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="استان"
                                invalid={Boolean(errors.state)}
                                errorMessage={errors.state?.message}
                            >
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="استان" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شهر"
                                invalid={Boolean(errors.city)}
                                errorMessage={errors.city?.message}
                            >
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شهر" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شهرستان"
                                invalid={Boolean(errors.county)}
                                errorMessage={errors.county?.message}
                            >
                                <Controller
                                    name="county"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شهرستان" />}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-3"
                                label="آدرس منزل"
                                invalid={Boolean(errors.homeAddress)}
                                errorMessage={errors.homeAddress?.message}
                            >
                                <Controller
                                    name="homeAddress"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={2}
                                            placeholder="آدرس منزل"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="نحوه آشنایی"
                                invalid={Boolean(errors.howKnow)}
                                errorMessage={errors.howKnow?.message}
                            >
                                <Controller
                                    name="howKnow"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'دوستان', label: 'دوستان' },
                                                { value: 'رسانه‌های اجتماعی', label: 'رسانه‌های اجتماعی' },
                                                { value: 'تبلیغات', label: 'تبلیغات' },
                                                { value: 'سایر', label: 'سایر' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="نحوه آشنایی"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="تحصیلات"
                                invalid={Boolean(errors.education)}
                                errorMessage={errors.education?.message}
                            >
                                <Controller
                                    name="education"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'دیپلم', label: 'دیپلم' },
                                                { value: 'کارشناسی', label: 'کارشناسی' },
                                                { value: 'کارشناسی ارشد', label: 'کارشناسی ارشد' },
                                                { value: 'دکتری', label: 'دکتری' },
                                                { value: 'فوق تخصص', label: 'فوق تخصص' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="تحصیلات"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="نوع کاربر"
                                invalid={Boolean(errors.userType)}
                                errorMessage={errors.userType?.message}
                            >
                                <Controller
                                    name="userType"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="نوع کاربر" disabled />
                                    )}
                                />
                            </FormItem>

                            {/* اطلاعات پزشک */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات پزشک</h5>
                            </div>

                            <FormItem
                                label="نام پدر"
                                invalid={Boolean(errors.fatherName)}
                                errorMessage={errors.fatherName?.message}
                            >
                                <Controller
                                    name="fatherName"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام پدر" />}
                                />
                            </FormItem>

                            <FormItem
                                label="کد نظام پزشکی"
                                invalid={Boolean(errors.medicalCode)}
                                errorMessage={errors.medicalCode?.message}
                            >
                                <Controller
                                    name="medicalCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="کد نظام پزشکی"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره تماس منشی/دوم"
                                invalid={Boolean(errors.secPhoneNumber)}
                                errorMessage={errors.secPhoneNumber?.message}
                            >
                                <Controller
                                    name="secPhoneNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تماس منشی یا شماره دوم" />}
                                />
                            </FormItem>

                            <FormItem
                                label="تخصص"
                                invalid={Boolean(errors.specialty)}
                                errorMessage={errors.specialty?.message}
                            >
                                <Controller
                                    name="specialty"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'عمومی', label: 'عمومی' },
                                                { value: 'داخلی', label: 'داخلی' },
                                                { value: 'جراحی', label: 'جراحی' },
                                                { value: 'اطفال', label: 'اطفال' },
                                                { value: 'زنان و زایمان', label: 'زنان و زایمان' },
                                                { value: 'ارتوپدی', label: 'ارتوپدی' },
                                                { value: 'چشم', label: 'چشم' },
                                                { value: 'گوش و حلق و بینی', label: 'گوش و حلق و بینی' },
                                                { value: 'پوست', label: 'پوست' },
                                                { value: 'قلب', label: 'قلب' },
                                                { value: 'روانپزشکی', label: 'روانپزشکی' },
                                                { value: 'سایر', label: 'سایر' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="تخصص"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="خدمات"
                                invalid={Boolean(errors.services)}
                                errorMessage={errors.services?.message}
                            >
                                <Controller
                                    name="services"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="خدماتی که ارائه می‌دهید (مثال: ویزیت، جراحی، مشاوره)"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="نوع همکاری"
                                invalid={Boolean(errors.collabType)}
                                errorMessage={errors.collabType?.message}
                            >
                                <Controller
                                    name="collabType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'تمام وقت', label: 'تمام وقت' },
                                                { value: 'پاره وقت', label: 'پاره وقت' },
                                                { value: 'داوطلبانه', label: 'داوطلبانه' },
                                                { value: 'مشاوره‌ای', label: 'مشاوره‌ای' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="نوع همکاری"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-3"
                                label="شرح همکاری"
                                invalid={Boolean(errors.contribution)}
                                errorMessage={errors.contribution?.message}
                            >
                                <Controller
                                    name="contribution"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={4}
                                            placeholder="توضیحات کامل درباره نوع همکاری، ساعات کاری، شرایط همکاری و ..."
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                className="mx-2"
                                variant="plain"
                                onClick={handleCancel}
                                type="button"
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={submitting}
                                disabled={submitting}
                            >
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت پزشک'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default DoctorForm;