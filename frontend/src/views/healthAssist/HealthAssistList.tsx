import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getHealthAssists, HealthAssistPerson, deleteHealthAssist } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const HealthAssistList = () => {
    const navigate = useNavigate()
    const [healthAssists, setHealthAssists] = useState<HealthAssistPerson[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [assistToDelete, setAssistToDelete] = useState<HealthAssistPerson | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchHealthAssists = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getHealthAssists(currentPage, pageSize)
            if (response.ok) {
                setHealthAssists(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست سلامت‌یاران
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching health assists:', error)
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
        fetchHealthAssists()
    }, [fetchHealthAssists])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddHealthAssist = () => {
        navigate('/health-assists/create')
    }

    const handleEdit = (assist: HealthAssistPerson) => {
        navigate(`/health-assists/edit/${assist.id}`)
    }

    const handleView = (assist: HealthAssistPerson) => {
        navigate(`/health-assists/view/${assist.id}`)
    }

    const handleDeleteClick = (assist: HealthAssistPerson) => {
        setAssistToDelete(assist)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!assistToDelete) return

        try {
            const response = await deleteHealthAssist(assistToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        سلامت‌یار با موفقیت حذف شد
                    </Notification>
                )
                fetchHealthAssists()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف سلامت‌یار'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting health assist:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setAssistToDelete(null)
        }
    }

    // فیلتر کردن سلامت‌یاران بر اساس جستجو
    const filteredHealthAssists = healthAssists.filter(assist => {
        if (!searchQuery) return true;
        
        const fullName = `${assist.user?.first_name || ''} ${assist.user?.last_name || ''}`.toLowerCase();
        const nationalCode = assist.user?.national_code?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || nationalCode.includes(query);
    });

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت سلامت‌یاران</h4>
                    <Button variant="solid" onClick={handleAddHealthAssist}>
                        افزودن سلامت‌یار جدید
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
                    ) : healthAssists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ سلامت‌یاری یافت نشد</p>
                            <Button variant="solid" onClick={handleAddHealthAssist}>
                                افزودن سلامت‌یار جدید
                            </Button>
                        </div>
                    ) : filteredHealthAssists.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredHealthAssists.length} سلامت‌یار از مجموع {totalItems} سلامت‌یار
                            </div>
                            
                            {/* جدول سلامت‌یاران */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام و نام خانوادگی</th>
                                            <th className="text-right p-3 border-b">کد ملی</th>
                                            <th className="text-right p-3 border-b">شماره تماس</th>
                                            <th className="text-right p-3 border-b">نوع همکاری</th>
                                            <th className="text-right p-3 border-b">توضیحات همکاری</th>
                                            <th className="text-right p-3 border-b">معرف</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHealthAssists.map((assist) => (
                                            <tr key={assist.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {assist.user ? `${assist.user.first_name} ${assist.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {assist.user?.national_code || ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {assist.user?.phone_number || ''}
                                                </td>
                                                <td className="p-3 border-b">
                                                    {assist.assistType}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="truncate block max-w-[200px]">
                                                        {assist.assiteDescription}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {assist.presenterFirstName || assist.presenterLastName ? 
                                                        `${assist.presenterFirstName || ''} ${assist.presenterLastName || ''}` : 
                                                        'ندارد'}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleView(assist)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlinePencil className="text-green-500" />}
                                                            onClick={() => handleEdit(assist)}
                                                            title="ویرایش"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(assist)}
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
                    آیا از حذف سلامت‌یار{' '}
                    <span className="font-semibold">
                        {assistToDelete?.user ? `${assistToDelete.user.first_name} ${assistToDelete.user.last_name}` : 'انتخاب شده'}
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

export default HealthAssistList