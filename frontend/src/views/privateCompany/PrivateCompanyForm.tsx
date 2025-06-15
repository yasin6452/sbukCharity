import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Checkbox from '@/components/ui/Checkbox'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PrivateCompanyFormData, createPrivateCompany, updatePrivateCompany, getPrivateCompany } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { HiOutlineUpload } from 'react-icons/hi'

// اسکیمای اعتبارسنجی فرم
const validationSchema = z.object({
    name: z.string().min(1, { message: 'نام شرکت الزامی است' }),
    yearFound: z.number().min(1300, { message: 'سال تأسیس باید معتبر باشد' }),
    license: z.boolean(),
    yearStart: z.number().min(1300, { message: 'سال شروع فعالیت باید معتبر باشد' }),
    yearLicense: z.number().min(1300).optional().nullable(),
    licenseReference: z.string().optional(), // اینجا رو اختیاری کردیم
    activity: z.string().min(1, { message: 'فعالیت‌ها الزامی است' }),
    specializedArea: z.string().min(1, { message: 'حوزه تخصصی الزامی است' }),
    targetCommunity: z.string().min(1, { message: 'جامعه هدف الزامی است' }),
    shareableFeatures: z.string().min(1, { message: 'ویژگی‌های قابل به اشتراک‌گذاری الزامی است' }),
    nameCeo: z.string().min(1, { message: 'نام مدیرعامل الزامی است' }),
    phoneNumberCeo: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    nameCeo2: z.string().optional().nullable(),
    phoneNumberCeo2: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    landLineNumber: z.string().regex(/^\d{8,15}$/, { message: 'شماره تلفن ثابت باید بین 8 تا 15 رقم باشد' }),
    state: z.string().min(1, { message: 'استان الزامی است' }),
    city: z.string().min(1, { message: 'شهر الزامی است' }),
    county: z.string().min(1, { message: 'شهرستان الزامی است' }),
    residentialAddress: z.string().min(1, { message: 'آدرس سکونت الزامی است' }),
    workplaceAddress: z.string().min(1, { message: 'آدرس محل کار الزامی است' }),
    scopeActivity: z.string().min(1, { message: 'حوزه فعالیت الزامی است' }),
    nameRepresentative: z.string().min(1, { message: 'نام نماینده الزامی است' }),
    mobileRepresentative: z.string().regex(/^(0|\+98)9\d{9}$/, { message: 'شماره موبایل باید با فرمت صحیح وارد شود' }),
    membershipRequest: z.any().optional(),
    activityLicense: z.any().optional(),
    collectionLogo: z.any().optional(),
}).refine(
    (data) => {
        if (data.yearStart < data.yearFound) {
            return false;
        }
        return true;
    },
    {
        message: "سال شروع فعالیت نمی‌تواند قبل از سال تأسیس باشد",
        path: ["yearStart"]
    }
).refine(
    (data) => {
        if (data.license && data.yearLicense && data.yearLicense < data.yearFound) {
            return false;
        }
        return true;
    },
    {
        message: "سال اخذ مجوز نمی‌تواند قبل از سال تأسیس باشد",
        path: ["yearLicense"]
    }
).refine(
    (data) => {
        // اگر تیک مجوز خورده باشد، مرجع صدور مجوز الزامی است
        if (data.license && (!data.licenseReference || data.licenseReference.trim() === '')) {
            return false;
        }
        return true;
    },
    {
        message: "مرجع صدور مجوز الزامی است",
        path: ["licenseReference"]
    }
);

type FormSchema = z.infer<typeof validationSchema>;

const PrivateCompanyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [membershipRequestFile, setMembershipRequestFile] = useState<File | null>(null);
    const [activityLicenseFile, setActivityLicenseFile] = useState<File | null>(null);
    const [collectionLogoFile, setCollectionLogoFile] = useState<File | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            yearFound: 0,
            license: true,
            yearStart: 0,
            yearLicense: null,
            licenseReference: '',
            activity: '',
            specializedArea: '',
            targetCommunity: '',
            shareableFeatures: '',
            nameCeo: '',
            phoneNumberCeo: '',
            nameCeo2: null,
            phoneNumberCeo2: '',
            landLineNumber: '',
            state: '',
            city: '',
            county: '',
            residentialAddress: '',
            workplaceAddress: '',
            scopeActivity: '',
            nameRepresentative: '',
            mobileRepresentative: '',
        }
    });

    const hasLicense = watch('license');

    // افزودن useEffect برای نمایش خطاهای فرم در کنسول
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors);
        }
    }, [errors]);

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCompany = async () => {
                setLoading(true);
                try {
                    const response = await getPrivateCompany(parseInt(id));
                    if (response.ok && response.data) {
                        reset({
                            name: response.data.name,
                            yearFound: response.data.yearFound,
                            license: response.data.license,
                            yearStart: response.data.yearStart,
                            yearLicense: response.data.yearLicense,
                            licenseReference: response.data.licenseReference,
                            activity: response.data.activity,
                            specializedArea: response.data.specializedArea,
                            targetCommunity: response.data.targetCommunity,
                            shareableFeatures: response.data.shareableFeatures,
                            nameCeo: response.data.nameCeo,
                            phoneNumberCeo: response.data.phoneNumberCeo,
                            nameCeo2: response.data.nameCeo2,
                            phoneNumberCeo2: response.data.phoneNumberCeo2,
                            landLineNumber: response.data.landLineNumber,
                            state: response.data.state,
                            city: response.data.city,
                            county: response.data.county,
                            residentialAddress: response.data.residentialAddress,
                            workplaceAddress: response.data.workplaceAddress,
                            scopeActivity: response.data.scopeActivity,
                            nameRepresentative: response.data.nameRepresentative,
                            mobileRepresentative: response.data.mobileRepresentative,
                        });
                    } else {
                        toast.push(
                            <Notification title="خطا" type="danger">
                                خطا در دریافت اطلاعات شرکت خصوصی
                            </Notification>
                        );
                        navigate('/private-companies');
                    }
                } catch (error) {
                    toast.push(
                        <Notification title="خطا" type="danger">
                            خطا در ارتباط با سرور
                        </Notification>
                    );
                    navigate('/private-companies');
                } finally {
                    setLoading(false);
                }
            };

            fetchCompany();
        }
    }, [isEditMode, id, reset, navigate]);

    const onSubmit = async (data: FormSchema) => {
        console.log('Form submitted successfully with data:', data); // افزودن لاگ
        setSubmitting(true);
        try {
            const formData = {
                ...data,
                membershipRequest: membershipRequestFile || undefined,
                activityLicense: activityLicenseFile || undefined,
                collectionLogo: collectionLogoFile || undefined,
            };

            let response;
            if (isEditMode && id) {
                response = await updatePrivateCompany(parseInt(id), formData);
            } else {
                response = await createPrivateCompany(formData);
            }

            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        {isEditMode ? 'اطلاعات شرکت خصوصی با موفقیت بروزرسانی شد' : 'شرکت خصوصی جدید با موفقیت ثبت شد'}
                    </Notification>
                );
                navigate('/private-companies');
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || (isEditMode ? 'خطا در بروزرسانی اطلاعات شرکت خصوصی' : 'خطا در ثبت شرکت خصوصی جدید')}
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
        navigate('/private-companies');
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
                        {isEditMode ? 'ویرایش اطلاعات شرکت خصوصی' : 'ثبت شرکت خصوصی جدید'}
                    </h4>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* اطلاعات اولیه شرکت */}
                            <div className="col-span-full mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات اولیه شرکت</h5>
                            </div>

                            <FormItem
                                label="نام شرکت"
                                invalid={Boolean(errors.name)}
                                errorMessage={errors.name?.message}
                            >
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام شرکت" />}
                                />
                            </FormItem>

                            <FormItem
                                label="سال تأسیس"
                                invalid={Boolean(errors.yearFound)}
                                errorMessage={errors.yearFound?.message}
                            >
                                <Controller
                                    name="yearFound"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="سال تأسیس"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="سال شروع فعالیت"
                                invalid={Boolean(errors.yearStart)}
                                errorMessage={errors.yearStart?.message}
                            >
                                <Controller
                                    name="yearStart"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="سال شروع فعالیت"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem className="col-span-3 flex items-center gap-2">
                                <Controller
                                    name="license"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onChange={field.onChange}
                                        >
                                            دارای مجوز فعالیت
                                        </Checkbox>
                                    )}
                                />
                            </FormItem>

                            {hasLicense && (
                                <>
                                    <FormItem
                                        label="سال اخذ مجوز"
                                        invalid={Boolean(errors.yearLicense)}
                                        errorMessage={errors.yearLicense?.message}
                                    >
                                        <Controller
                                            name="yearLicense"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                    placeholder="سال اخذ مجوز"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="مرجع صدور مجوز"
                                        invalid={Boolean(errors.licenseReference)}
                                        errorMessage={errors.licenseReference?.message}
                                        className="col-span-2"
                                    >
                                        <Controller
                                            name="licenseReference"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="مرجع صدور مجوز" />}
                                        />
                                    </FormItem>
                                </>
                            )}

                            {/* اطلاعات فعالیت */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات فعالیت</h5>
                            </div>

                            <FormItem
                                label="فعالیت‌ها"
                                invalid={Boolean(errors.activity)}
                                errorMessage={errors.activity?.message}
                                className="col-span-3"
                            >
                                <Controller
                                    name="activity"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={2}
                                            placeholder="فعالیت‌های شرکت"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="حوزه تخصصی"
                                invalid={Boolean(errors.specializedArea)}
                                errorMessage={errors.specializedArea?.message}
                            >
                                <Controller
                                    name="specializedArea"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="حوزه تخصصی" />}
                                />
                            </FormItem>

                            <FormItem
                                label="جامعه هدف"
                                invalid={Boolean(errors.targetCommunity)}
                                errorMessage={errors.targetCommunity?.message}
                            >
                                <Controller
                                    name="targetCommunity"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="جامعه هدف" />}
                                />
                            </FormItem>

                            <FormItem
                                label="حوزه فعالیت"
                                invalid={Boolean(errors.scopeActivity)}
                                errorMessage={errors.scopeActivity?.message}
                            >
                                <Controller
                                    name="scopeActivity"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="حوزه فعالیت" />}
                                />
                            </FormItem>

                            <FormItem
                                label="ویژگی‌های قابل به اشتراک‌گذاری"
                                invalid={Boolean(errors.shareableFeatures)}
                                errorMessage={errors.shareableFeatures?.message}
                                className="col-span-3"
                            >
                                <Controller
                                    name="shareableFeatures"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={2}
                                            placeholder="ویژگی‌های قابل به اشتراک‌گذاری شرکت"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* اطلاعات مدیران */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات مدیران</h5>
                            </div>

                            <FormItem
                                label="نام مدیرعامل"
                                invalid={Boolean(errors.nameCeo)}
                                errorMessage={errors.nameCeo?.message}
                            >
                                <Controller
                                    name="nameCeo"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام مدیرعامل" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره تماس مدیرعامل"
                                invalid={Boolean(errors.phoneNumberCeo)}
                                errorMessage={errors.phoneNumberCeo?.message}
                            >
                                <Controller
                                    name="phoneNumberCeo"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تماس مدیرعامل" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام مدیرعامل دوم (اختیاری)"
                                invalid={Boolean(errors.nameCeo2)}
                                errorMessage={errors.nameCeo2?.message}
                            >
                                <Controller
                                    name="nameCeo2"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            placeholder="نام مدیرعامل دوم (اختیاری)"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره تماس مدیرعامل دوم"
                                invalid={Boolean(errors.phoneNumberCeo2)}
                                errorMessage={errors.phoneNumberCeo2?.message}
                            >
                                <Controller
                                    name="phoneNumberCeo2"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره تماس مدیرعامل دوم" />}
                                />
                            </FormItem>

                            <FormItem
                                label="نام نماینده"
                                invalid={Boolean(errors.nameRepresentative)}
                                errorMessage={errors.nameRepresentative?.message}
                            >
                                <Controller
                                    name="nameRepresentative"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="نام نماینده" />}
                                />
                            </FormItem>

                            <FormItem
                                label="شماره موبایل نماینده"
                                invalid={Boolean(errors.mobileRepresentative)}
                                errorMessage={errors.mobileRepresentative?.message}
                            >
                                <Controller
                                    name="mobileRepresentative"
                                    control={control}
                                    render={({ field }) => <Input {...field} placeholder="شماره موبایل نماینده" />}
                                />
                            </FormItem>

                            {/* اطلاعات تماس و آدرس */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">اطلاعات تماس و آدرس</h5>
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
                                label="آدرس سکونت"
                                invalid={Boolean(errors.residentialAddress)}
                                errorMessage={errors.residentialAddress?.message}
                            >
                                <Controller
                                    name="residentialAddress"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={2}
                                            placeholder="آدرس سکونت"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                className="col-span-3"
                                label="آدرس محل کار"
                                invalid={Boolean(errors.workplaceAddress)}
                                errorMessage={errors.workplaceAddress?.message}
                            >
                                <Controller
                                    name="workplaceAddress"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            as="textarea"
                                            rows={2}
                                            placeholder="آدرس محل کار"
                                        />
                                    )}
                                />
                            </FormItem>

                            {/* فایل‌ها */}
                            <div className="col-span-full mt-4 mb-4">
                                <h5 className="text-md font-medium mb-2 p-2 bg-gray-50 rounded">مدارک و فایل‌ها</h5>
                            </div>

                            <FormItem
                                label="درخواست عضویت"
                                className="col-span-1"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={(files) => {
                                        if (files && files.length > 0) {
                                            setMembershipRequestFile(files[0]);
                                        }
                                    }}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">درخواست عضویت را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: PDF, DOC, DOCX (حداکثر 5MB)</p>
                                    </div>
                                </Upload>
                            </FormItem>

                            <FormItem
                                label="مجوز فعالیت"
                                className="col-span-1"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={(files) => {
                                        if (files && files.length > 0) {
                                            setActivityLicenseFile(files[0]);
                                        }
                                    }}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">مجوز فعالیت را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: PDF, DOC, DOCX (حداکثر 5MB)</p>
                                    </div>
                                </Upload>
                            </FormItem>

                            <FormItem
                                label="لوگوی شرکت"
                                className="col-span-1"
                            >
                                <Upload
                                    draggable
                                    className="border-2 border-dashed p-6 rounded-lg"
                                    uploadLimit={1}
                                    onChange={(files) => {
                                        if (files && files.length > 0) {
                                            setCollectionLogoFile(files[0]);
                                        }
                                    }}
                                    beforeUpload={() => false}
                                >
                                    <div className="text-center">
                                        <div className="my-1 flex justify-center">
                                            <HiOutlineUpload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">لوگوی شرکت را بکشید و رها کنید یا </span>
                                            <span className="text-blue-500">کلیک کنید</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فرمت‌های مجاز: JPG, PNG, SVG (حداکثر 2MB)</p>
                                    </div>
                                </Upload>
                            </FormItem>
                        </div>

                        <div className="flex justify-end mt-6 gap-2">
                            <Button
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
                                {isEditMode ? 'بروزرسانی اطلاعات' : 'ثبت شرکت خصوصی'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default PrivateCompanyForm;