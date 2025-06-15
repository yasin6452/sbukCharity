import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getPatients, Patient, deletePatient } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const PatientList = () => {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getPatients(currentPage, pageSize)
            console.log('API response:', response); // برای دیباگ
            
            if (response.ok) {
                setPatients(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست بیماران
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching patients:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize])

    useEffect(() => {
        fetchPatients()
    }, [fetchPatients])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddPatient = () => {
        navigate('/patients/create')
    }

    const handleEdit = (patient: Patient) => {
        navigate(`/patients/edit/${patient.id}`)
    }

    const handleView = (patient: Patient) => {
        navigate(`/patients/view/${patient.id}`)
    }

    const handleDeleteClick = (patient: Patient) => {
        setPatientToDelete(patient)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!patientToDelete) return

        try {
            const response = await deletePatient(patientToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        بیمار با موفقیت حذف شد
                    </Notification>
                )
                fetchPatients()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف بیمار'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting patient:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setPatientToDelete(null)
        }
    }

    // فیلتر کردن بیماران بر اساس جستجو
    const filteredPatients = patients.filter(patient => {
        if (!searchQuery) return true;
        
        const fullName = `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.toLowerCase();
        const nationalCode = patient.user?.national_code?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || nationalCode.includes(query);
    });

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت بیماران</h4>
                    <Button variant="solid" onClick={handleAddPatient}>
                        افزودن بیمار جدید
                    </Button>
                </div>

                {/* نوار جستجو */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <Input
                            prefix={<HiSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="جستجو بر اساس نام یا کد ملی..."
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <Spinner size={40} />
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ بیماری یافت نشد</p>
                            <Button variant="solid" onClick={handleAddPatient}>
                                افزودن بیمار جدید
                            </Button>
                        </div>
                    ) : filteredPatients.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredPatients.length} بیمار از مجموع {totalItems} بیمار
                            </div>
                            
                            {/* جدول بیماران با استفاده از div ها */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام و نام خانوادگی</th>
                                            <th className="text-right p-3 border-b">کد ملی</th>
                                            <th className="text-right p-3 border-b">سن</th>
                                            <th className="text-right p-3 border-b">عضو بیمار</th>
                                            <th className="text-right p-3 border-b">توضیحات بیماری</th>
                                            <th className="text-right p-3 border-b">شماره تماس</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {patient.user?.national_code || ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {patient.age} سال
                                                </td>
                                                <td className="p-3 border-b">
                                                    {patient.organ}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="truncate block max-w-[200px]">
                                                        {patient.sicknessDescription}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {patient.user?.phone_number || ''}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleView(patient)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlinePencil className="text-green-500" />}
                                                            onClick={() => handleEdit(patient)}
                                                            title="ویرایش"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(patient)}
                                                            title="حذف"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">نمایش</span>
                                    <select
                                        className="border p-1 rounded text-sm"
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm">آیتم در هر صفحه</span>
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            قبلی
                                        </Button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                size="sm"
                                                variant={currentPage === page ? "solid" : "plain"}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            بعدی
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Dialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onRequestClose={() => setDeleteConfirmOpen(false)}
            >
                <h5 className="mb-4">تایید حذف</h5>
                <p>
                    آیا از حذف بیمار{' '}
                    <span className="font-semibold">
                        {patientToDelete?.user ? `${patientToDelete.user.first_name} ${patientToDelete.user.last_name}` : 'انتخاب شده'}
                    </span>{' '}
                    اطمینان دارید؟
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="mr-2"
                        variant="plain"
                        onClick={() => setDeleteConfirmOpen(false)}
                    >
                        انصراف
                    </Button>
                    <Button variant="solid" color="red" onClick={handleDeleteConfirm}>
                        حذف
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default PatientList