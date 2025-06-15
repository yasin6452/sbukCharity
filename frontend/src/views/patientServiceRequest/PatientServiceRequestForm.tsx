import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
    PatientServiceRequestFormData, 
    createPatientServiceRequest, 
    getPatientByNationalCode,
    Patient 
} from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui'

// اسکیمای اعتبارسنجی برای مرحله یک (ورود کد ملی)
const patientSearchSchema = z.object({
    nationalCode: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
});

// اسکیمای اعتبارسنجی برای مرحله دو (فرم درخواست سرویس)
const serviceRequestSchema = z.object({
    usingResidence: z.boolean(),
    numberOfWoman: z.number().min(0, { message: 'تعداد زنان نمی‌تواند منفی باشد' }),
    numberOfMan: z.number().min(0, { message: 'تعداد مردان نمی‌تواند منفی باشد' }),
    explain: z.string().min(1, { message: 'توضیحات الزامی است' }),
    neededService: z.string().min(1, { message: 'سرویس مورد نیاز الزامی است' }),
}).refine(
    (data) => data.numberOfWoman > 0 || data.numberOfMan > 0, 
    {
        message: "حداقل تعداد افراد زن یا مرد باید بیشتر از صفر باشد",
        path: ["numberOfWoman"]
    }
);

const PatientServiceRequestForm = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [step, setStep] = useState(1); // 1: جستجوی بیمار، 2: تکمیل فرم درخواست

    // فرم جستجوی بیمار
    const searchForm = useForm<{ nationalCode: string }>({
        resolver: zodResolver(patientSearchSchema),
        defaultValues: {
            nationalCode: '',
        }
    });

    // فرم درخواست سرویس
    const serviceForm = useForm<Omit<PatientServiceRequestFormData, 'national_code'>>({
        resolver: zodResolver(serviceRequestSchema),
        defaultValues: {
            usingResidence: false,
            numberOfWoman: 0,
            numberOfMan: 0,
            explain: '',
            neededService: '',
        }
    });

    // جستجوی بیمار با کد ملی
    const handleSearchPatient = async (data: { nationalCode: string }) => {
        setIsSearching(true);
        try {
            const response = await getPatientByNationalCode(data.nationalCode);
            if (response.ok && response.data) {
                setPatient(response.data);
                setStep(2);
                toast.push(
                    <Notification title="موفقیت" type="success">
                        اطلاعات بیمار با موفقیت دریافت شد
                    </Notification>
                );
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'بیمار با این کد ملی یافت نشد'}
                    </Notification>
                );
            }
        } catch (error: any) {
            console.error('Error searching patient:', error);
            let errorMessage = 'خطا در ارتباط با سرور';
            
            // استخراج پیام خطا از پاسخ API
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || errorMessage;
            }
            
            toast.push(
                <Notification title="خطا" type="danger">
                    {errorMessage}
                </Notification>
            );
        } finally {
            setIsSearching(false);
        }
    };

    // ثبت درخواست سرویس
    const handleSubmitServiceRequest = async (data: Omit<PatientServiceRequestFormData, 'national_code'>) => {
        if (!patient) return;

        setIsSubmitting(true);
        try {
            const requestData: PatientServiceRequestFormData = {
                ...data,
                national_code: patient.user.national_code,
            };

            const response = await createPatientServiceRequest(requestData);
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        درخواست سرویس با موفقیت ثبت شد
                    </Notification>
                );
                navigate('/patient-service-requests'); // مسیر لیست درخواست‌ها
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در ثبت درخواست سرویس'}
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
            setIsSubmitting(false);
        }
    };

    // برگشت به مرحله جستجوی بیمار
    const handleBackToSearch = () => {
        setStep(1);
        setPatient(null);
        serviceForm.reset();
    };

    // انصراف و بازگشت به صفحه قبل
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4">
                        درخواست سرویس بیمار
                    </h4>

                    {step === 1 ? (
                        // مرحله 1: جستجوی بیمار با کد ملی
                        <Form onSubmit={searchForm.handleSubmit(handleSearchPatient)}>
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem
                                    label="کد ملی بیمار"
                                    invalid={Boolean(searchForm.formState.errors.nationalCode)}
                                    errorMessage={searchForm.formState.errors.nationalCode?.message}
                                >
                                    <Controller
                                        name="nationalCode"
                                        control={searchForm.control}
                                        render={({ field }) => (
                                            <Input 
                                                {...field} 
                                                placeholder="کد ملی بیمار را وارد کنید" 
                                            />
                                        )}
                                    />
                                </FormItem>

                                <div className="flex justify-end gap-2 mt-4">
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
                                        loading={isSearching}
                                        disabled={isSearching}
                                    >
                                        جستجوی بیمار
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    ) : (
                        // مرحله 2: فرم درخواست سرویس
                        <>
                            {patient && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h5 className="text-md font-medium mb-4">اطلاعات بیمار</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">نام و نام خانوادگی</p>
                                            <p className="font-medium">
                                                {patient.user.first_name} {patient.user.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">کد ملی</p>
                                            <p className="font-medium">{patient.user.national_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">شماره تماس</p>
                                            <p className="font-medium">{patient.user.phone_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">عضو بیمار</p>
                                            <p className="font-medium">{patient.organ}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-500 text-sm">آدرس</p>
                                            <p className="font-medium">{patient.user.homeAddress}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Form onSubmit={serviceForm.handleSubmit(handleSubmitServiceRequest)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem className="col-span-full">
                                        <Controller
                                            name="usingResidence"
                                            control={serviceForm.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    استفاده از اقامتگاه
                                                </Checkbox>
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="تعداد زنان"
                                        invalid={Boolean(serviceForm.formState.errors.numberOfWoman)}
                                        errorMessage={serviceForm.formState.errors.numberOfWoman?.message}
                                    >
                                        <Controller
                                            name="numberOfWoman"
                                            control={serviceForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    placeholder="تعداد زنان"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="تعداد مردان"
                                        invalid={Boolean(serviceForm.formState.errors.numberOfMan)}
                                        errorMessage={serviceForm.formState.errors.numberOfMan?.message}
                                    >
                                        <Controller
                                            name="numberOfMan"
                                            control={serviceForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    placeholder="تعداد مردان"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="سرویس مورد نیاز"
                                        invalid={Boolean(serviceForm.formState.errors.neededService)}
                                        errorMessage={serviceForm.formState.errors.neededService?.message}
                                        className="col-span-full"
                                    >
                                        <Controller
                                            name="neededService"
                                            control={serviceForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="سرویس مورد نیاز"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="توضیحات"
                                        invalid={Boolean(serviceForm.formState.errors.explain)}
                                        errorMessage={serviceForm.formState.errors.explain?.message}
                                        className="col-span-full"
                                    >
                                        <Controller
                                            name="explain"
                                            control={serviceForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="توضیحات بیشتر درباره درخواست"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Button
                                        variant="plain"
                                        onClick={handleBackToSearch}
                                        type="button"
                                    >
                                        بازگشت به جستجو
                                    </Button>
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
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        ثبت درخواست
                                    </Button>
                                </div>
                            </Form>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default PatientServiceRequestForm;