import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'
import { getGovernmentOrganizations, deleteGovernmentOrganization, GovernmentOrganization } from '@/services/data'

const GovernmentOrganizationList = () => {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<GovernmentOrganization[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [orgToDelete, setOrgToDelete] = useState<GovernmentOrganization | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); 
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchOrganizations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getGovernmentOrganizations(currentPage, pageSize, debouncedSearchQuery);
            if (response.ok) {
                setOrganizations(response.data);
                setTotalItems(response.pagination.total_count);
                setTotalPages(response.pagination.total_pages);
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت لیست سازمان‌ها'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearchQuery]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };
    const handleAddOrganization = () => navigate('/government-organizations/create');
    const handleEdit = (org: GovernmentOrganization) => navigate(`/government-organizations/edit/${org.id}`);
    const handleView = (org: GovernmentOrganization) => navigate(`/government-organizations/view/${org.id}`);
    const handleDeleteClick = (org: GovernmentOrganization) => {
        setOrgToDelete(org);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!orgToDelete) return;
        try {
            const response = await deleteGovernmentOrganization(orgToDelete.id);
            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">سازمان دولتی با موفقیت حذف شد.</Notification>);
                fetchOrganizations(); 
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در حذف سازمان.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
        } finally {
            setDeleteConfirmOpen(false);
            setOrgToDelete(null);
        }
    };

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت سازمان‌های دولتی</h4>
                    <Button variant="solid" onClick={handleAddOrganization}>افزودن سازمان دولتی</Button>
                </div>

                <div className="px-4 mb-4">
                    <Input
                        prefix={<HiSearch className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو بر اساس نام، شهر، نوع، حوزه فعالیت..."
                        className="w-full"
                    />
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60"><Spinner size={40} /></div>
                    ) : organizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">{debouncedSearchQuery ? 'موردی یافت نشد.' : 'هیچ سازمانی ثبت نشده است.'}</p>
                            <Button variant={debouncedSearchQuery ? "plain" : "solid"} onClick={debouncedSearchQuery ? () => setSearchQuery('') : handleAddOrganization}>
                                {debouncedSearchQuery ? 'پاک کردن جستجو' : 'افزودن سازمان دولتی'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">نمایش {organizations.length} سازمان از مجموع {totalItems} سازمان</div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام سازمان</th>
                                            <th className="text-right p-3 border-b">نوع</th>
                                            <th className="text-right p-3 border-b">حوزه فعالیت</th>
                                            <th className="text-right p-3 border-b">شهر</th>
                                            <th className="text-right p-3 border-b">تلفن اصلی</th>
                                            <th className="text-right p-3 border-b">وضعیت</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organizations.map((org) => (
                                            <tr key={org.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b font-medium">{org.name}</td>
                                                <td className="p-3 border-b">{org.type}</td>
                                                <td className="p-3 border-b">{org.activityArea}</td>
                                                <td className="p-3 border-b">{org.city}</td>
                                                <td className="p-3 border-b font-mono">{org.mainPhoneNumber}</td>
                                                <td className="p-3 border-b">{org.status}</td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="plain" icon={<HiOutlineEye />} onClick={() => handleView(org)} title="مشاهده" />
                                                        <Button size="sm" variant="plain" icon={<HiOutlinePencil className="text-blue-600"/>} onClick={() => handleEdit(org)} title="ویرایش" />
                                                        <Button size="sm" variant="plain" icon={<HiOutlineTrash className="text-red-600"/>} onClick={() => handleDeleteClick(org)} title="حذف" />
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
                                    <span className="text-sm">آیتم در هر صفحه</span>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
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
                <h5 className="mb-4">تایید حذف سازمان</h5>
                <p>آیا از حذف سازمان <span className="font-semibold">"{orgToDelete?.name}"</span> اطمینان دارید؟</p>
                <div className="text-right mt-6">
                    <Button className="mr-2" variant="plain" onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button variant="solid" color="red" onClick={handleDeleteConfirm}>حذف</Button>
                </div>
            </Dialog>
        </div>
    );
};

export default GovernmentOrganizationList;