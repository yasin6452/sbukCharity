import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createConsultationRequest, getPatientByNationalCode, Patient, ConsultationRequestFormData } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui'

const patientSearchSchema = z.object({
    nationalCode: z.string().regex(/^\d{10}$/, { message: 'کد ملی باید 10 رقم باشد' }),
});

const consultationRequestSchema = z.object({
    subject: z.string().min(1, { message: 'موضوع مشاوره الزامی است' }),
    description: z.string().min(1, { message: 'توضیحات الزامی است' }),
    consultationType: z.string().min(1, { message: 'نوع مشاوره الزامی است' }),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
});

type PatientSearchFormSchema = z.infer<typeof patientSearchSchema>;
type ConsultationRequestFormSchema = Omit<ConsultationRequestFormData, 'national_code'>;

const ConsultationRequestForm = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [step, setStep] = useState(1);

    const searchForm = useForm<PatientSearchFormSchema>({
        resolver: zodResolver(patientSearchSchema),
        defaultValues: { nationalCode: '' }
    });

    const requestForm = useForm<ConsultationRequestFormSchema>({
        resolver: zodResolver(consultationRequestSchema),
        defaultValues: { subject: '', description: '', consultationType: '', preferredDate: '', preferredTime: '' }
    });

    const handleSearchPatient = async (data: PatientSearchFormSchema) => {
        setIsSearching(true);
        try {
            const response = await getPatientByNationalCode(data.nationalCode);
            if (response.ok && response.data) {
                setPatient(response.data);
                setStep(2);
                toast.push(<Notification title="موفقیت" type="success">بیمار یافت شد.</Notification>);
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'بیماری با این کد ملی یافت نشد.'}</Notification>);
            }
        } catch (error: any) {
            toast.push(<Notification title="خطا" type="danger">{error?.response?.data?.message || 'خطا در ارتباط با سرور'}</Notification>);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmitRequest = async (data: ConsultationRequestFormSchema) => {
        if (!patient) return;
        setIsSubmitting(true);
        try {
            const fullData: ConsultationRequestFormData = {
                ...data,
                national_code: patient.user.national_code,
            };
            const response = await createConsultationRequest(fullData);
            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message || 'درخواست ثبت شد.'}</Notification>);
                navigate('/consultation-requests');
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در ثبت درخواست.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBackToSearch = () => {
        setStep(1);
        setPatient(null);
        requestForm.reset();
    };

    const consultationTypeOptions = [
        { value: 'آنلاین', label: 'آنلاین' },
        { value: 'حضوری', label: 'حضوری' },
        { value: 'تلفنی', label: 'تلفنی' },
    ];

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1000px] mx-auto">
                <div className="p-4">
                    <h4 className="text-lg font-semibold mb-6">ثبت درخواست مشاوره جدید</h4>
                    {step === 1 && (
                        <Form onSubmit={searchForm.handleSubmit(handleSearchPatient)}>
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem label="کد ملی بیمار" invalid={!!searchForm.formState.errors.nationalCode} errorMessage={searchForm.formState.errors.nationalCode?.message}>
                                    <Controller name="nationalCode" control={searchForm.control} render={({ field }) => (<Input {...field} placeholder="کد ملی بیمار را برای شروع وارد کنید" />)} />
                                </FormItem>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="plain" onClick={() => navigate('/consultation-requests')} type="button">انصراف</Button>
                                    <Button variant="solid" type="submit" loading={isSearching}>جستجوی بیمار</Button>
                                </div>
                            </div>
                        </Form>
                    )}
                    {step === 2 && patient && (
                        <>
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h5 className="text-md font-medium mb-3">اطلاعات بیمار</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <p><span className="font-semibold">نام:</span> {patient.user.first_name} {patient.user.last_name}</p>
                                    <p><span className="font-semibold">کد ملی:</span> {patient.user.national_code}</p>
                                    <p><span className="font-semibold">تلفن:</span> {patient.user.phone_number}</p>
                                </div>
                            </div>
                            <Form onSubmit={requestForm.handleSubmit(handleSubmitRequest)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem label="موضوع مشاوره" invalid={!!requestForm.formState.errors.subject} errorMessage={requestForm.formState.errors.subject?.message} className="col-span-full">
                                        <Controller name="subject" control={requestForm.control} render={({ field }) => ( <Input {...field} placeholder="مثال: مشاوره در مورد بیماری دیابت" /> )} />
                                    </FormItem>
                                    <FormItem label="نوع مشاوره" invalid={!!requestForm.formState.errors.consultationType} errorMessage={requestForm.formState.errors.consultationType?.message}>
                                        <Controller name="consultationType" control={requestForm.control} render={({ field }) => (<Select options={consultationTypeOptions} value={consultationTypeOptions.find(opt => opt.value === field.value)} onChange={(option) => field.onChange(option?.value)} placeholder="انتخاب نوع مشاوره" />)}/>
                                    </FormItem>
                                    <FormItem label="تاریخ پیشنهادی (اختیاری)"><Controller name="preferredDate" control={requestForm.control} render={({ field }) => ( <Input {...field} type="date" /> )} /></FormItem>
                                    <FormItem label="زمان پیشنهادی (اختیاری)"><Controller name="preferredTime" control={requestForm.control} render={({ field }) => ( <Input {...field} type="time" /> )} /></FormItem>
                                    <FormItem label="توضیحات کامل درخواست" invalid={!!requestForm.formState.errors.description} errorMessage={requestForm.formState.errors.description?.message} className="col-span-full">
                                        <Controller name="description" control={requestForm.control} render={({ field }) => ( <Input {...field} as="textarea" rows={4} placeholder="جزئیات درخواست مشاوره خود را شرح دهید..." /> )} />
                                    </FormItem>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="default" onClick={handleBackToSearch} type="button">بازگشت به جستجو</Button>
                                    <Button variant="plain" onClick={() => navigate('/consultation-requests')} type="button">انصراف</Button>
                                    <Button variant="solid" type="submit" loading={isSubmitting}>ثبت درخواست</Button>
                                </div>
                            </Form>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ConsultationRequestForm;