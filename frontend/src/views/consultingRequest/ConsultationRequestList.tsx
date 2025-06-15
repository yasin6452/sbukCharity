import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlineEye, HiOutlineTrash, HiSearch } from 'react-icons/hi'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'
import { getConsultationRequests, deleteConsultationRequest, ConsultationRequest } from '@/services/data'

const ConsultationRequestList = () => {
    const navigate = useNavigate()
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [requestToDelete, setRequestToDelete] = useState<ConsultationRequest | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);
    
    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getConsultationRequests(currentPage, pageSize, debouncedSearchQuery)
            if (response.ok) {
                setConsultationRequests(response.data)
                setTotalItems(response.pagination.total_count)
                setTotalPages(response.pagination.total_pages)
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت لیست درخواست‌ها'}</Notification>)
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>)
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, debouncedSearchQuery])

    useEffect(() => {
        fetchRequests()
    }, [fetchRequests])

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };
    const handleAddRequest = () => navigate('/consultation-requests/create');
    const handleViewDetails = (request: ConsultationRequest) => navigate(`/consultation-requests/view/${request.id}`);
    const handleDeleteClick = (request: ConsultationRequest) => {
        setRequestToDelete(request)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!requestToDelete) return
        try {
            const response = await deleteConsultationRequest(requestToDelete.id)
            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">{response.message || 'درخواست با موفقیت حذف شد'}</Notification>)
                fetchRequests() 
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در حذف درخواست'}</Notification>)
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>)
        } finally {
            setDeleteConfirmOpen(false)
            setRequestToDelete(null)
        }
    }

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت درخواست‌های مشاوره</h4>
                    <Button variant="solid" onClick={handleAddRequest}>افزودن درخواست</Button>
                </div>
                <div className="px-4 mb-4">
                    <Input
                        prefix={<HiSearch className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو بر اساس نام، کد ملی بیمار یا موضوع..."
                        className="w-full"
                    />
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60"><Spinner size={40} /></div>
                    ) : consultationRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                             <p className="mb-2">{debouncedSearchQuery ? 'موردی یافت نشد.' : 'هیچ درخواستی ثبت نشده است.'}</p>
                            <Button variant={debouncedSearchQuery ? "plain" : "solid"} onClick={debouncedSearchQuery ? () => setSearchQuery('') : handleAddRequest}>
                                {debouncedSearchQuery ? 'پاک کردن جستجو' : 'افزودن درخواست'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">نمایش {consultationRequests.length} از {totalItems} درخواست</div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">بیمار</th>
                                            <th className="text-right p-3 border-b">کد ملی بیمار</th>
                                            <th className="text-right p-3 border-b">موضوع مشاوره</th>
                                            <th className="text-right p-3 border-b">نوع مشاوره</th>
                                            <th className="text-right p-3 border-b">وضعیت</th>
                                            <th className="text-right p-3 border-b">تاریخ ثبت</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consultationRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b font-medium">{request.user ? `${request.user.first_name} ${request.user.last_name}` : 'نامشخص'}</td>
                                                <td className="p-3 border-b font-mono">{request.user?.national_code || ''}</td>
                                                <td className="p-3 border-b"><span className="truncate block max-w-[200px]">{request.subject}</span></td>
                                                <td className="p-3 border-b">{request.consultationType}</td>
                                                <td className="p-3 border-b">{request.status}</td>
                                                <td className="p-3 border-b">{new Date(request.created_at).toLocaleDateString('fa-IR')}</td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="plain" icon={<HiOutlineEye className="text-blue-500" />} onClick={() => handleViewDetails(request)} title="مشاهده" />
                                                        <Button size="sm" variant="plain" icon={<HiOutlineTrash className="text-red-500" />} onClick={() => handleDeleteClick(request)} title="حذف" />
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
                                    <select className="border p-1 rounded text-sm" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
                                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                                    </select>
                                    <span className="text-sm">آیتم</span>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="plain" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>قبلی</Button>
                                        <span className="text-sm p-2">صفحه {currentPage} از {totalPages}</span>
                                        <Button size="sm" variant="plain" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>بعدی</Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Card>
            <Dialog isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onRequestClose={() => setDeleteConfirmOpen(false)}>
                <h5 className="mb-4">تایید حذف</h5>
                <p>آیا از حذف درخواست مشاوره برای <span className="font-semibold">{requestToDelete?.user ? `${requestToDelete.user.first_name} ${requestToDelete.user.last_name}` : 'بیمار'}</span> اطمینان دارید؟</p>
                <div className="text-right mt-6">
                    <Button className="mr-2" variant="plain" onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button variant="solid" color="red" onClick={handleDeleteConfirm}>حذف</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ConsultationRequestList