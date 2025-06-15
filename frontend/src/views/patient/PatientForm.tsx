import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Upload from '@/components/ui/Upload'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PatientFormData, Patient, createPatient, updatePatient, getPatient } from '@/services/data'
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
    
    // اطلاعات بیمار
    national_code: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
    presenterNationalCode: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }).nullable().optional(),
    presenterFirstName: z.string().min(1, { message: 'نام الزامی است' }).nullable().optional(),
    presenterLastName: z.string().min(1, { message: 'نام خانوادگی الزامی است' }).nullable().optional(),
    fatherName: z.string().min(1, { message: 'نام پدر الزامی است' }),
    age: z.number().min(0, { message: 'سن باید بزرگتر یا مساوی صفر باشد' }),
    maritalStatus: z.string().min(1, { message: 'وضعیت تاهل الزامی است' }),
    headHouseHold: z.boolean(),
    numberDependents: z.number().min(0, { message: 'تعداد افراد تحت تکفل باید بزرگتر یا مساوی صفر باشد' }),
    familyStatus: z.string().min(1, { message: 'وضعیت خانواده الزامی است' }),
    jobStatus: z.boolean(),
    skill: z.string().min(1, { message: 'مهارت الزامی است' }),
    homeStatus: z.string().min(1, { message: 'وضعیت مسکن الزامی است' }),
    lineNumber: z.string().regex(/^\d{8,15}$/, { message: 'شماره خط باید بین 8 تا 15 رقم باشد' }),
    organ: z.string().min(1, { message: 'عضو بیمار الزامی است' }),
    bankCardNumber: z.string().regex(/^\d{16}$/, { message: 'شماره کارت بانکی باید 16 رقم باشد' }),
    insurance: z.string().min(1, { message: 'بیمه الزامی است' }),
    sicknessDescription: z.string().min(1, { message: 'توضیحات بیماری الزامی است' }),
    familiar1Name: z.string().min(1, { message: 'نام آشنا 1 الزامی است' }),
    familiar1FamilyName: z.string().min(1, { message: 'نام خانوادگی آشنا 1 الزامی است' }),
    familiar1PhoneNumber: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    familiar2Name: z.string().min(1, { message: 'نام آشنا 2 الزامی است' }),
    familiar2FamilyName: z.string().min(1, { message: 'نام خانوادگی آشنا 2 الزامی است' }),
    familiar2PhoneNumber: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    
    // فایل‌ها اختیاری هستند
    nationalCardImage: z.any().optional(),
    nationalCertificateImage: z.any().optional(),
});

type FormSchema = z.infer<typeof validationSchema>;

const PatientForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    
    // فایل‌های آپلود شده
    const [nationalCardFile, setNationalCardFile] = useState<File | null>(null);
    const [nationalCertificateFile, setCertificateFile] = useState<File | null>(null);

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
            userType: 'بیمار', // مقدار پیش فرض

            // اطلاعات بیمار
            national_code: '',
            presenterNationalCode: null,
            presenterFirstName: null,
            presenterLastName: null,
            fatherName: '',
            age: 0,
            maritalStatus: '',
            headHouseHold: false,
            numberDependents: 0,
            familyStatus: '',
            jobStatus: false,
            skill: '',
            homeStatus: '',
            lineNumber: '',
            organ: '',
            bankCardNumber: '',
            insurance: '',
            sicknessDescription: '',
            familiar1Name: '',
            familiar1FamilyName: '',
            familiar1PhoneNumber: '',
            familiar2Name: '',
            familiar2FamilyName: '',
            familiar2PhoneNumber: '',
        }
    });

    // نظارت بر تغییر برخی فیلدها
    const hasPresenter = watch('presenterNationalCode') !== null && watch('presenterNationalCode') !== '';

    useEffect(() => {
        if (isEditMode && id) {
            const fetchPatient = async () => {
                setLoading(true);
                try {
                    const response = await getPatient(parseInt(id));
                    if (response.ok && response.data) {
                        setPatient(response.data);
                        
                        // پر کردن فرم با اطلاعات بیمار و کاربر
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
                            userType: response.data.user?.userType || 'بیمار',
                            
                            // اطلاعات بیمار
                            national_code: response.data.national_code,
                            presenterNationalCode: response.data.presenterNationalCode,
                            presenterFirstName: response.data.presenterFirstName,
                            presenterLastName: response.data.presenterLastName,
                            fatherName: response.data.fatherName,
                            age: response.data.age,
                            maritalStatus: response.data.maritalStatus,
                            headHouseHold: response.data.headHouseHold,
                            numberDependents: response.data.numberDependents,
                            familyStatus: response.data.familyStatus,
                            jobStatus: response.data.jobStatus,
                            skill: response.data.skill,
                            homeStatus: response.data.homeStatus,
                            lineNumber: response.data.lineNumber,
                            organ: response.data.organ,
                            bankCardNumber: response.data.bankCardNumber,
                            insurance: response.data.insurance,
                            sicknessDescription: response.data.sicknessDescription,
                            familiar1Name: response.data.familiar1Name,
                            familiar1FamilyName: response.data.familiar1FamilyName,
                            familiar1PhoneNumber: response.data.familiar1PhoneNumber,
                            familiar2Name: response.data.familiar2Name,
                            familiar2FamilyName: response.data.familiar2FamilyName,
                            familiar2PhoneNumber: response.data.familiar2PhoneNumber,
                        });
                    } else {
                        toast.push(
                            <Notification title="خطا" type="danger">
                                خطا در دریافت اطلاعات بیمار
                            </Notification>
                        );
                        navigate('/patients');
                    }
                } catch (error) {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در ارتباط با سرور
                        </Notification>
                    );
                    navigate('/patients');
                } finally {
                    setLoading(false);
                }
            };

            fetchPatient();
        }
    }, [isEditMode, id, reset, navigate]);

    // آماده‌سازی داده‌ها برای ارسال به سرور
    const prepareFormData = (data: FormSchema) => {
        const formData = new FormData();
        
        // تبدیل تمام فیلدها به FormData
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, value ? 'true' : 'false');
                } else {
                    formData.append(key, value.toString());
                }
            }
        });
        
        // اضافه کردن فایل‌ها در صورت وجود
        if (nationalCardFile) {
            formData.append('nationalCardImage', nationalCardFile);
        }
        
        if (nationalCertificateFile) {
            formData.append('nationalCertificateImage', nationalCertificateFile);
        }
        
        return formData;
    };

    const onSubmit = async (data: FormSchema) => {
        setSubmitting(true);
        try {
            // آماده‌سازی داده‌ها برای ارسال
            const formData = prepareFormData(data);
            
            let response;
            if (isEditMode && id) {
                response = await updatePatient(parseInt(id), formData);
            } else {
                response = await createPatient(formData);
            }

            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        {isEditMode ? 'اطلاعات بیمار با موفقیت بروزرسانی شد' : 'بیمار جدید با موفقیت ثبت شد'}
                    </Notification>
                );
                navigate('/patients');
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || (isEditMode ? 'خطا در بروزرسانی اطلاعات بیمار' : 'خطا در ثبت بیمار جدید')}
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
        navigate('/patients');
    };

    // مدیریت تغییر فایل‌ها
    const handleNationalCardChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setNationalCardFile(files[0]);
        }
    };
    
    const handleCertificateChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setCertificateFile(files[0]);
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
                        {isEditMode ? 'ویرایش اطلاعات بیمار' : 'ثبت بیمار جدید'}
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
                                        <Input {...field} placeholder="کد ملی بیمار" disabled={isEditMode} />
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

                            {/* اطلاعات پایه بیمار */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات پایه بیمار</h5>
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
                                label="سن"
                                invalid={Boolean(errors.age)}
                                errorMessage={errors.age?.message}
                            >
                                <Controller
                                    name="age"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            placeholder="سن"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="وضعیت تأهل"
                                invalid={Boolean(errors.maritalStatus)}
                                errorMessage={errors.maritalStatus?.message}
                            >
                                <Controller
                                    name="maritalStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'مجرد', label: 'مجرد' },
                                                { value: 'متأهل', label: 'متأهل' },
                                                { value: 'مطلقه', label: 'مطلقه' },
                                                { value: 'بیوه', label: 'بیوه' }
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="انتخاب وضعیت تأهل"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem>
                                <Controller
                                    name="headHouseHold"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onChange={field.onChange}
                                        >
                                            سرپرست خانوار
                                        </Checkbox>
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="تعداد افراد تحت تکفل"
                                invalid={Boolean(errors.numberDependents)}
                                errorMessage={errors.numberDependents?.message}
                            >
                                <Controller
                                    name="numberDependents"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            placeholder="تعداد افراد تحت تکفل"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* مدارک هویتی */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">مدارک هویتی</h5>
                            </div>

                            <FormItem
                                label="تصویر کارت ملی"
                                className="col-span-3 md:col-span-1"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={handleNationalCardChange}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">تصویر کارت ملی را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: JPEG، PNG (حداکثر 2MB)</p>
                                    </div>
                                </Upload>
                            </FormItem>

                            <FormItem
                                label="تصویر شناسنامه"
                                className="col-span-3 md:col-span-1"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={handleCertificateChange}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">تصویر شناسنامه را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: JPEG، PNG (حداکثر 2MB)</p>
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

                            {/* اطلاعات شغلی و مسکن */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات شغلی و مسکن</h5>
                            </div>

                            <FormItem>
                                <Controller
                                    name="jobStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onChange={field.onChange}
                                        >
                                            شاغل
                                        </Checkbox>
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="مهارت"
                                invalid={Boolean(errors.skill)}
                                errorMessage={errors.skill?.message}
                            >
                                <Controller
                                    name="skill"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="مهارت" />}
                                />
                            </FormItem>

                            <FormItem
                                label="وضعیت مسکن"
                                invalid={Boolean(errors.homeStatus)}
                                errorMessage={errors.homeStatus?.message}
                            >
                                <Controller
                                    name="homeStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'ملکی', label: 'ملکی' },
                                                { value: 'استیجاری', label: 'استیجاری' },
                                                { value: 'رهن', label: 'رهن' },
                                                { value: 'منزل اقوام', label: 'منزل اقوام' },
                                                { value: 'سایر', label: 'سایر' }
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="انتخاب وضعیت مسکن"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-3"
                                label="وضعیت خانواده"
                                invalid={Boolean(errors.familyStatus)}
                                errorMessage={errors.familyStatus?.message}
                            >
                                <Controller
                                    name="familyStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={3}
                                            placeholder="توضیحات وضعیت خانواده"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* اطلاعات تماس و بانکی */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات تماس و بانکی</h5>
                            </div>

                            <FormItem
                                label="شماره تلفن ثابت"
                                invalid={Boolean(errors.lineNumber)}
                                errorMessage={errors.lineNumber?.message}
                            >
                                <Controller
                                    name="lineNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تلفن ثابت" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره کارت بانکی"
                                invalid={Boolean(errors.bankCardNumber)}
                                errorMessage={errors.bankCardNumber?.message}
                            >
                                <Controller
                                    name="bankCardNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره کارت بانکی" />}
                                />
                            </FormItem>

                            <FormItem
                                label="بیمه"
                                invalid={Boolean(errors.insurance)}
                                errorMessage={errors.insurance?.message}
                            >
                                <Controller
                                    name="insurance"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={[
                                                { value: 'تأمین اجتماعی', label: 'تأمین اجتماعی' },
                                                { value: 'خدمات درمانی', label: 'خدمات درمانی' },
                                                { value: 'سلامت', label: 'سلامت' },
                                                { value: 'نیروهای مسلح', label: 'نیروهای مسلح' },
                                                { value: 'ندارد', label: 'ندارد' }
                                            ]}
                                            value={{ value: field.value, label: field.value }}
                                            onChange={(option) => field.onChange(option?.value)}
                                            placeholder="انتخاب نوع بیمه"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* اطلاعات بیماری */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات بیماری</h5>
                            </div>

                            <FormItem
                                label="عضو بیمار"
                                invalid={Boolean(errors.organ)}
                                errorMessage={errors.organ?.message}
                            >
                                <Controller
                                    name="organ"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="عضو بیمار" />}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-3"
                                label="توضیحات بیماری"
                                invalid={Boolean(errors.sicknessDescription)}
                                errorMessage={errors.sicknessDescription?.message}
                            >
                                <Controller
                                    name="sicknessDescription"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={3}
                                            placeholder="توضیحات بیماری"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* اطلاعات آشنایان */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات آشنایان</h5>
                            </div>

                            <FormItem
                                label="نام آشنای اول"
                                invalid={Boolean(errors.familiar1Name)}
                                errorMessage={errors.familiar1Name?.message}
                            >
                                <Controller
                                    name="familiar1Name"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام آشنای اول" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام خانوادگی آشنای اول"
                                invalid={Boolean(errors.familiar1FamilyName)}
                                errorMessage={errors.familiar1FamilyName?.message}
                            >
                                <Controller
                                    name="familiar1FamilyName"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام خانوادگی آشنای اول" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره تماس آشنای اول"
                                invalid={Boolean(errors.familiar1PhoneNumber)}
                                errorMessage={errors.familiar1PhoneNumber?.message}
                            >
                                <Controller
                                    name="familiar1PhoneNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تماس آشنای اول" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام آشنای دوم"
                                invalid={Boolean(errors.familiar2Name)}
                                errorMessage={errors.familiar2Name?.message}
                            >
                                <Controller
                                    name="familiar2Name"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام آشنای دوم" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام خانوادگی آشنای دوم"
                                invalid={Boolean(errors.familiar2FamilyName)}
                                errorMessage={errors.familiar2FamilyName?.message}
                            >
                                <Controller
                                    name="familiar2FamilyName"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام خانوادگی آشنای دوم" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره تماس آشنای دوم"
                                invalid={Boolean(errors.familiar2PhoneNumber)}
                                errorMessage={errors.familiar2PhoneNumber?.message}
                            >
                                <Controller
                                    name="familiar2PhoneNumber"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تماس آشنای دوم" />}
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
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت بیمار'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default PatientForm;