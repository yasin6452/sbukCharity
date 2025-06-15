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
import { HealthAssistFormData, createHealthAssist, updateHealthAssist, getHealthAssist } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { HiOutlineUpload } from 'react-icons/hi'

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
    
    // اطلاعات سلامت‌یار
    national_code: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
    presenterNationalCode: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }).nullable().optional(),
    presenterFirstName: z.string().min(1, { message: 'نام الزامی است' }).nullable().optional(),
    presenterLastName: z.string().min(1, { message: 'نام خانوادگی الزامی است' }).nullable().optional(),
    assistType: z.string().min(1, { message: 'نوع همکاری الزامی است' }),
    assiteDescription: z.string().min(1, { message: 'توضیحات همکاری الزامی است' }),
    letterFile: z.any().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const HealthAssistForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [letterFile, setLetterFile] = useState<File | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
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
            userType: 'سلامت‌یار',

            // اطلاعات سلامت‌یار
            national_code: '',
            presenterNationalCode: null,
            presenterFirstName: null,
            presenterLastName: null,
            assistType: '',
            assiteDescription: '',
        }
    });

    // نظارت بر تغییر فیلد کد ملی معرف
    const hasPresenter = watch('presenterNationalCode') !== null && watch('presenterNationalCode') !== '';

    useEffect(() => {
        if (isEditMode && id) {
            const fetchHealthAssist = async () => {
                setLoading(true);
                try {
                    const response = await getHealthAssist(parseInt(id));
                    if (response.ok && response.data) {
                        // پر کردن فرم با اطلاعات سلامت‌یار و کاربر
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
                            userType: response.data.user?.userType || 'سلامت‌یار',
                            
                            // اطلاعات سلامت‌یار
                            national_code: response.data.user?.national_code || '',
                            presenterNationalCode: response.data.presenterNationalCode,
                            presenterFirstName: response.data.presenterFirstName,
                            presenterLastName: response.data.presenterLastName,
                            assistType: response.data.assistType,
                            assiteDescription: response.data.assiteDescription,
                        });
                    } else {
                        toast.push(
                            <Notification title="خطا" type="danger">
                                خطا در دریافت اطلاعات سلامت‌یار
                            </Notification>
                        );
                        navigate('/health-assists');
                    }
                } catch (error) {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در ارتباط با سرور
                        </Notification>
                    );
                    navigate('/health-assists');
                } finally {
                    setLoading(false);
                }
            };

            fetchHealthAssist();
        }
    }, [isEditMode, id, reset, navigate]);

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        try {
            const formData = {
                ...data,
                letterFile: letterFile || undefined
            };

            let response;
            if (isEditMode && id) {
                response = await updateHealthAssist(parseInt(id), formData);
            } else {
                response = await createHealthAssist(formData);
            }

            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        {isEditMode ? 'اطلاعات سلامت‌یار با موفقیت بروزرسانی شد' : 'سلامت‌یار جدید با موفقیت ثبت شد'}
                    </Notification>
                );
                navigate('/health-assists');
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || (isEditMode ? 'خطا در بروزرسانی اطلاعات سلامت‌یار' : 'خطا در ثبت سلامت‌یار جدید')}
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
        navigate('/health-assists');
    };

    const handleLetterFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setLetterFile(files[0]);
        }
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
                        {isEditMode ? 'ویرایش اطلاعات سلامت‌یار' : 'ثبت سلامت‌یار جدید'}
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
                                        <Input {...field} placeholder="کد ملی سلامت‌یار" disabled={isEditMode} />
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

                            {/* اطلاعات سلامت‌یار */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات سلامت‌یار</h5>
                            </div>

                            <FormItem
                                label="نوع همکاری"
                                invalid={Boolean(errors.assistType)}
                                errorMessage={errors.assistType?.message}
                            >
                                <Controller
                                    name="assistType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'پزشک', label: 'پزشک' },
                                                { value: 'پرستار', label: 'پرستار' },
                                                { value: 'مشاور', label: 'مشاور' },
                                                { value: 'سایر', label: 'سایر' },
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="نوع همکاری"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-2"
                                label="توضیحات همکاری"
                                invalid={Boolean(errors.assiteDescription)}
                                errorMessage={errors.assiteDescription?.message}
                            >
                                <Controller
                                    name="assiteDescription"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={3}
                                            placeholder="توضیحات همکاری"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="فایل معرفی‌نامه"
                                className="col-span-3"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={handleLetterFileChange}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">فایل معرفی‌نامه را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: PDF, DOC, DOCX (حداکثر 5MB)</p>
                                    </div>
                                </Upload>
                            </FormItem>

                            {/* اطلاعات معرف */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات معرف</h5>
                            </div>

                            <FormItem
                                label="کد ملی معرف"
                                invalid={Boolean(errors.presenterNationalCode)}
                                errorMessage={errors.presenterNationalCode?.message}
                            >
                                <Controller
                                    name="presenterNationalCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            placeholder="کد ملی معرف"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="نام معرف"
                                invalid={Boolean(errors.presenterFirstName)}
                                errorMessage={errors.presenterFirstName?.message}
                                className={!hasPresenter ? 'opacity-50' : ''}
                            >
                                <Controller
                                    name="presenterFirstName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            placeholder="نام معرف"
                                            disabled={!hasPresenter}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="نام خانوادگی معرف"
                                invalid={Boolean(errors.presenterLastName)}
                                errorMessage={errors.presenterLastName?.message}
                                className={!hasPresenter ? 'opacity-50' : ''}
                            >
                                <Controller
                                    name="presenterLastName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            placeholder="نام خانوادگی معرف"
                                            disabled={!hasPresenter}
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
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت سلامت‌یار'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default HealthAssistForm;