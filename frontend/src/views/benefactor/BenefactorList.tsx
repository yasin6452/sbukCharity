import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getBenefactors, BenefactorPerson, deleteBenefactor } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const BenefactorList = () => {
    const navigate = useNavigate()
    const [benefactors, setBenefactors] = useState<BenefactorPerson[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [benefactorToDelete, setBenefactorToDelete] = useState<BenefactorPerson | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchBenefactors = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getBenefactors(currentPage, pageSize)
            if (response.ok) {
                setBenefactors(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست افراد خیر
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching benefactors:', error)
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
        fetchBenefactors()
    }, [fetchBenefactors])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddBenefactor = () => {
        navigate('/benefactors/create')
    }

    const handleEdit = (benefactor: BenefactorPerson) => {
        navigate(`/benefactors/edit/${benefactor.id}`)
    }

    const handleView = (benefactor: BenefactorPerson) => {
        navigate(`/benefactors/view/${benefactor.id}`)
    }

    const handleDeleteClick = (benefactor: BenefactorPerson) => {
        setBenefactorToDelete(benefactor)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!benefactorToDelete) return

        try {
            const response = await deleteBenefactor(benefactorToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        فرد خیر با موفقیت حذف شد
                    </Notification>
                )
                fetchBenefactors()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف فرد خیر'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting benefactor:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setBenefactorToDelete(null)
        }
    }

    // فیلتر کردن افراد خیر بر اساس جستجو
    const filteredBenefactors = benefactors.filter(benefactor => {
        if (!searchQuery) return true;
        
        const fullName = `${benefactor.user?.first_name || ''} ${benefactor.user?.last_name || ''}`.toLowerCase();
        const nationalCode = benefactor.user?.national_code?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || nationalCode.includes(query);
    });

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت افراد خیر</h4>
                    <Button variant="solid" onClick={handleAddBenefactor}>
                        افزودن فرد خیر جدید
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
                    ) : benefactors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ فرد خیری یافت نشد</p>
                            <Button variant="solid" onClick={handleAddBenefactor}>
                                افزودن فرد خیر جدید
                            </Button>
                        </div>
                    ) : filteredBenefactors.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredBenefactors.length} فرد خیر از مجموع {totalItems} فرد خیر
                            </div>
                            
                            {/* جدول افراد خیر */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام و نام خانوادگی</th>
                                            <th className="text-right p-3 border-b">کد ملی</th>
                                            <th className="text-right p-3 border-b">شماره تماس</th>
                                            <th className="text-right p-3 border-b">شماره تلفن ثابت</th>
                                            <th className="text-right p-3 border-b">نوع مشارکت</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBenefactors.map((benefactor) => (
                                            <tr key={benefactor.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {benefactor.user ? `${benefactor.user.first_name} ${benefactor.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="font-mono">
                                                        {benefactor.user?.national_code || ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {benefactor.user?.phone_number || ''}
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {benefactor.landLineNumber}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="truncate block max-w-[200px]">
                                                        {benefactor.contribution}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleView(benefactor)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlinePencil className="text-green-500" />}
                                                            onClick={() => handleEdit(benefactor)}
                                                            title="ویرایش"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(benefactor)}
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
                    آیا از حذف فرد خیر{' '}
                    <span className="font-semibold">
                        {benefactorToDelete?.user ? `${benefactorToDelete.user.first_name} ${benefactorToDelete.user.last_name}` : 'انتخاب شده'}
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

export default BenefactorList