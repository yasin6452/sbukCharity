import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getDoctors, Doctor, deleteDoctor } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const DoctorList = () => {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getDoctors(currentPage, pageSize)
            if (response.ok) {
                setDoctors(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست پزشکان
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching doctors:', error)
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
        fetchDoctors()
    }, [fetchDoctors])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddDoctor = () => {
        navigate('/doctors/create')
    }

    const handleEdit = (doctor: Doctor) => {
        navigate(`/doctors/edit/${doctor.id}`)
    }

    const handleView = (doctor: Doctor) => {
        navigate(`/doctors/view/${doctor.id}`)
    }

    const handleDeleteClick = (doctor: Doctor) => {
        setDoctorToDelete(doctor)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!doctorToDelete) return

        try {
            const response = await deleteDoctor(doctorToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        پزشک با موفقیت حذف شد
                    </Notification>
                )
                fetchDoctors()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف پزشک'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting doctor:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setDoctorToDelete(null)
        }
    }

    // فیلتر کردن پزشکان بر اساس جستجو
    const filteredDoctors = doctors.filter(doctor => {
        if (!searchQuery) return true;
        
        const fullName = `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.toLowerCase();
        const nationalCode = doctor.user?.national_code?.toLowerCase() || '';
        const medicalCode = doctor.medicalCode?.toString() || '';
        const specialty = doctor.specialty?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || 
               nationalCode.includes(query) || 
               medicalCode.includes(query) || 
               specialty.includes(query);
    });

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت پزشکان</h4>
                    <Button variant="solid" onClick={handleAddDoctor}>
                        افزودن پزشک جدید
                    </Button>
                </div>

                {/* نوار جستجو */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <Input
                            prefix={<HiSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="جستجو بر اساس نام، کد ملی، کد نظام پزشکی یا تخصص..."
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <Spinner size={40} />
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ پزشکی یافت نشد</p>
                            <Button variant="solid" onClick={handleAddDoctor}>
                                افزودن پزشک جدید
                            </Button>
                        </div>
                    ) : filteredDoctors.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredDoctors.length} پزشک از مجموع {totalItems} پزشک
                            </div>
                            
                            {/* جدول پزشکان */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام و نام خانوادگی</th>
                                            <th className="text-right p-3 border-b">کد ملی</th>
                                            <th className="text-right p-3 border-b">کد نظام پزشکی</th>
                                            <th className="text-right p-3 border-b">تخصص</th>
                                            <th className="text-right p-3 border-b">شماره تماس</th>
                                            <th className="text-right p-3 border-b">شماره منشی</th>
                                            <th className="text-right p-3 border-b">نوع همکاری</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDoctors.map((doctor) => (
                                            <tr key={doctor.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {doctor.user ? `${doctor.user.first_name} ${doctor.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {doctor.user?.national_code || ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {doctor.medicalCode}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {doctor.specialty}
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {doctor.user?.phone_number || ''}
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {doctor.secPhoneNumber}
                                                </td>
                                                <td className="p-3 border-b">
                                                    {doctor.collabType}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleView(doctor)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlinePencil className="text-green-500" />}
                                                            onClick={() => handleEdit(doctor)}
                                                            title="ویرایش"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(doctor)}
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
                    آیا از حذف پزشک{' '}
                    <span className="font-semibold">
                        {doctorToDelete?.user ? `${doctorToDelete.user.first_name} ${doctorToDelete.user.last_name}` : 'انتخاب شده'}
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

export default DoctorList