import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getPatientServiceRequests, PatientServiceRequest, deletePatientServiceRequest } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const PatientServiceRequestList = () => {
    const navigate = useNavigate()
    const [serviceRequests, setServiceRequests] = useState<PatientServiceRequest[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [requestToDelete, setRequestToDelete] = useState<PatientServiceRequest | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchServiceRequests = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getPatientServiceRequests(currentPage, pageSize)
            
            if (response.ok) {
                setServiceRequests(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست درخواست‌های سرویس
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching service requests:', error)
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
        fetchServiceRequests()
    }, [fetchServiceRequests])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddServiceRequest = () => {
        navigate('/patient-service-requests/create')
    }

    const handleViewDetails = (request: PatientServiceRequest) => {
        navigate(`/patient-service-requests/view/${request.id}`)
    }

    const handleDeleteClick = (request: PatientServiceRequest) => {
        setRequestToDelete(request)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!requestToDelete) return

        try {
            const response = await deletePatientServiceRequest(requestToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        درخواست سرویس با موفقیت حذف شد
                    </Notification>
                )
                fetchServiceRequests()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف درخواست سرویس'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting service request:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setRequestToDelete(null)
        }
    }

    // فیلتر کردن درخواست‌ها بر اساس جستجو
    const filteredRequests = serviceRequests.filter(request => {
        if (!searchQuery) return true
        
        const fullName = `${request.user?.first_name || ''} ${request.user?.last_name || ''}`.toLowerCase()
        const nationalCode = request.user?.national_code?.toLowerCase() || ''
        const query = searchQuery.toLowerCase()
        
        return fullName.includes(query) || nationalCode.includes(query)
    })

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت درخواست‌های سرویس بیمار</h4>
                    <Button variant="solid" onClick={handleAddServiceRequest}>
                        افزودن درخواست سرویس جدید
                    </Button>
                </div>

                {/* نوار جستجو */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <Input
                            prefix={<HiSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="جستجو بر اساس نام یا کد ملی بیمار..."
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <Spinner size={40} />
                        </div>
                    ) : serviceRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ درخواست سرویسی یافت نشد</p>
                            <Button variant="solid" onClick={handleAddServiceRequest}>
                                افزودن درخواست سرویس جدید
                            </Button>
                        </div>
                    ) : filteredRequests.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredRequests.length} درخواست از مجموع {totalItems} درخواست
                            </div>
                            
                            {/* جدول درخواست‌ها */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام و نام خانوادگی بیمار</th>
                                            <th className="text-right p-3 border-b">کد ملی</th>
                                            <th className="text-right p-3 border-b">استفاده از اقامتگاه</th>
                                            <th className="text-right p-3 border-b">تعداد افراد</th>
                                            <th className="text-right p-3 border-b">سرویس مورد نیاز</th>
                                            <th className="text-right p-3 border-b">تاریخ ثبت</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {request.user ? `${request.user.first_name} ${request.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {request.user?.national_code || ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {request.usingResidence ? 'بله' : 'خیر'}
                                                </td>
                                                <td className="p-3 border-b">
                                                    {`زن: ${request.numberOfWoman} - مرد: ${request.numberOfMan}`}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="truncate block max-w-[200px]">
                                                        {request.neededService}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {new Date(request.created_at).toLocaleDateString('fa-IR')}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleViewDetails(request)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(request)}
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
                    آیا از حذف درخواست سرویس برای بیمار{' '}
                    <span className="font-semibold">
                        {requestToDelete?.user ? `${requestToDelete.user.first_name} ${requestToDelete.user.last_name}` : 'انتخاب شده'}
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

export default PatientServiceRequestList