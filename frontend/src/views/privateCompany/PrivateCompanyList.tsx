import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import { getPrivateCompanies, PrivateCompany, deletePrivateCompany } from '@/services/data'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'

const PrivateCompanyList = () => {
    const navigate = useNavigate()
    const [companies, setCompanies] = useState<PrivateCompany[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [companyToDelete, setCompanyToDelete] = useState<PrivateCompany | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchCompanies = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getPrivateCompanies(currentPage, pageSize)
            if (response.ok) {
                setCompanies(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        خطا در دریافت لیست شرکت‌های خصوصی
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error fetching companies:', error)
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
        fetchCompanies()
    }, [fetchCompanies])

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleAddCompany = () => {
        navigate('/private-companies/create')
    }

    const handleEdit = (company: PrivateCompany) => {
        navigate(`/private-companies/edit/${company.id}`)
    }

    const handleView = (company: PrivateCompany) => {
        navigate(`/private-companies/view/${company.id}`)
    }

    const handleDeleteClick = (company: PrivateCompany) => {
        setCompanyToDelete(company)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!companyToDelete) return

        try {
            const response = await deletePrivateCompany(companyToDelete.id)
            if (response.ok) {
                toast.push(
                    <Notification title="موفقیت" type="success">
                        شرکت خصوصی با موفقیت حذف شد
                    </Notification>
                )
                fetchCompanies()
            } else {
                toast.push(
                    <Notification title="خطا" type="danger">
                        {response.message || 'خطا در حذف شرکت خصوصی'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting company:', error)
            toast.push(
                <Notification title="خطا" type="danger">
                    خطا در ارتباط با سرور
                </Notification>
            )
        } finally {
            setDeleteConfirmOpen(false)
            setCompanyToDelete(null)
        }
    }

    // فیلتر کردن شرکت‌ها بر اساس جستجو
    const filteredCompanies = companies.filter(company => {
        if (!searchQuery) return true;
        
        const name = company.name?.toLowerCase() || '';
        const ceoName = company.nameCeo?.toLowerCase() || '';
        const activity = company.activity?.toLowerCase() || '';
        const city = company.city?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return name.includes(query) || 
               ceoName.includes(query) || 
               activity.includes(query) || 
               city.includes(query);
    });

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت شرکت‌های خصوصی</h4>
                    <Button variant="solid" onClick={handleAddCompany}>
                        افزودن شرکت خصوصی جدید
                    </Button>
                </div>

                {/* نوار جستجو */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <Input
                            prefix={<HiSearch className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="جستجو بر اساس نام شرکت، مدیرعامل، فعالیت یا شهر..."
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <Spinner size={40} />
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ شرکت خصوصی یافت نشد</p>
                            <Button variant="solid" onClick={handleAddCompany}>
                                افزودن شرکت خصوصی جدید
                            </Button>
                        </div>
                    ) : filteredCompanies.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">هیچ نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            <Button variant="plain" onClick={() => setSearchQuery('')}>
                                پاک کردن جستجو
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                نمایش {filteredCompanies.length} شرکت از مجموع {totalItems} شرکت
                            </div>
                            
                            {/* جدول شرکت‌ها */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام شرکت</th>
                                            <th className="text-right p-3 border-b">مدیرعامل</th>
                                            <th className="text-right p-3 border-b">حوزه فعالیت</th>
                                            <th className="text-right p-3 border-b">سال تأسیس</th>
                                            <th className="text-right p-3 border-b">استان/شهر</th>
                                            <th className="text-right p-3 border-b">تلفن</th>
                                            <th className="text-right p-3 border-b">وضعیت مجوز</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCompanies.map((company) => (
                                            <tr key={company.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">
                                                    <span className="font-medium">
                                                        {company.name}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {company.nameCeo}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className="truncate block max-w-[200px]">
                                                        {company.scopeActivity}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    {company.yearFound}
                                                </td>
                                                <td className="p-3 border-b">
                                                    {company.state} / {company.city}
                                                </td>
                                                <td className="p-3 border-b font-mono">
                                                    {company.landLineNumber}
                                                </td>
                                                <td className="p-3 border-b">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        company.license 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {company.license ? 'دارای مجوز' : 'فاقد مجوز'}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineEye className="text-blue-500" />}
                                                            onClick={() => handleView(company)}
                                                            title="مشاهده"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlinePencil className="text-green-500" />}
                                                            onClick={() => handleEdit(company)}
                                                            title="ویرایش"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            icon={<HiOutlineTrash className="text-red-500" />}
                                                            onClick={() => handleDeleteClick(company)}
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
                    آیا از حذف شرکت{' '}
                    <span className="font-semibold">
                        {companyToDelete?.name}
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

export default PrivateCompanyList