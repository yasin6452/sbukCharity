import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BenefactorFormData, createBenefactor, updateBenefactor, getBenefactor } from '@/services/data'
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
    
    // اطلاعات فرد خیر
    national_code: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
    landLineNumber: z.string().regex(/^\d{8,15}$/, { message: 'شماره تلفن ثابت باید بین 8 تا 15 رقم باشد' }),
    contribution: z.string().min(1, { message: 'نوع مشارکت الزامی است' }),
});

type FormSchema = z.infer<typeof validationSchema>;

const BenefactorForm = () => {
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
            userType: 'خیّر',

            // اطلاعات فرد خیر
            national_code: '',
            landLineNumber: '',
            contribution: '',
        }
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchBenefactor = async () => {
                setLoading(true);
                try {
                    const response = await getBenefactor(parseInt(id));
                    if (response.ok && response.data) {
                        // پر کردن فرم با اطلاعات فرد خیر و کاربر
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
                            userType: response.data.user?.userType || 'خیّر',
                            
                            // اطلاعات فرد خیر
                            national_code: response.data.user?.national_code || '',
                            landLineNumber: response.data.landLineNumber,
                            contribution: response.data.contribution,
                        });
                    } else {
                        toast.push(
                            <Notification title="خطا" type="danger">
                                خطا در دریافت اطلاعات فرد خیر
                            </Notification>
                        );
                        navigate('/benefactors');
                    }
                } catch (error) {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در ارتباط با سرور
                        </Notification>
                    );
                    navigate('/benefactors');
                } finally {
                    setLoading(false);
                }
            };

            fetchBenefactor();
        }
    }, [isEditMode, id, reset, navigate]);

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        try {
            const formData: BenefactorFormData = {
                ...data
            };

            let response;
            if (isEditMode && id) {
                response = await updateBenefactor(parseInt(id), formData);
            } else {
                response = await createBenefactor(formData);
            }

            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        {isEditMode ? 'اطلاعات فرد خیر با موفقیت بروزرسانی شد' : 'فرد خیر جدید با موفقیت ثبت شد'}
                    </Notification>
                );
                navigate('/benefactors');
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || (isEditMode ? 'خطا در بروزرسانی اطلاعات فرد خیر' : 'خطا در ثبت فرد خیر جدید')}
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
        navigate('/benefactors');
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
                        {isEditMode ? 'ویرایش اطلاعات فرد خیر' : 'ثبت فرد خیر جدید'}
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
                                        <Input {...field} placeholder="کد ملی فرد خیر" disabled={isEditMode} />
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
                                                { value: 'ابتدایی', label: 'ابتدایی' },
                                                { value: 'سیکل', label: 'سیکل' },
                                                { value: 'دیپلم', label: 'دیپلم' },
                                                { value: 'کارشناسی', label: 'کارشناسی' },
                                                { value: 'کارشناسی ارشد', label: 'کارشناسی ارشد' },
                                                { value: 'دکتری', label: 'دکتری' },
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

                            {/* اطلاعات فرد خیر */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات فرد خیر</h5>
                            </div>

                            <FormItem
                                label="شماره تلفن ثابت"
                                invalid={Boolean(errors.landLineNumber)}
                                errorMessage={errors.landLineNumber?.message}
                            >
                                <Controller
                                    name="landLineNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تلفن ثابت" />}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-2"
                                label="نوع مشارکت"
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
                                            rows={3}
                                            placeholder="نوع مشارکت (کمک نقدی، غیرنقدی، خدماتی و ...)"
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
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت فرد خیر'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default BenefactorForm;