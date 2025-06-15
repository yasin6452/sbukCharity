import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiSearch } from 'react-icons/hi'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { Spinner, Input } from '@/components/ui'
import Dialog from '@/components/ui/Dialog'
import { getCharityCenters, deleteCharityCenter, CharityCenter } from '@/services/data'

const CharityCenterList = () => {
    const navigate = useNavigate();
    const [charityCenters, setCharityCenters] = useState<CharityCenter[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [centerToDelete, setCenterToDelete] = useState<CharityCenter | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchCenters = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCharityCenters(currentPage, pageSize, debouncedSearchQuery);
            if (response.ok) {
                setCharityCenters(response.data);
                setTotalItems(response.pagination.total_count);
                setTotalPages(response.pagination.total_pages);
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در دریافت لیست مراکز'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور</Notification>);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearchQuery]);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };
    const handleAddCenter = () => navigate('/charity-centers/create');
    const handleEdit = (center: CharityCenter) => navigate(`/charity-centers/edit/${center.id}`);
    const handleView = (center: CharityCenter) => navigate(`/charity-centers/view/${center.id}`);
    const handleDeleteClick = (center: CharityCenter) => {
        setCenterToDelete(center);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!centerToDelete) return;
        try {
            const response = await deleteCharityCenter(centerToDelete.id);
            if (response.ok) {
                toast.push(<Notification title="موفقیت" type="success">مرکز نیکوکاری حذف شد.</Notification>);
                fetchCenters();
            } else {
                toast.push(<Notification title="خطا" type="danger">{response.message || 'خطا در حذف مرکز.'}</Notification>);
            }
        } catch (error) {
            toast.push(<Notification title="خطا" type="danger">خطا در ارتباط با سرور.</Notification>);
        } finally {
            setDeleteConfirmOpen(false);
            setCenterToDelete(null);
        }
    };

    return (
        <div className="min-h-screen w-full p-4">
            <Card className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-4 p-4">
                    <h4 className="text-lg font-semibold">مدیریت مراکز نیکوکاری</h4>
                    <Button variant="solid" onClick={handleAddCenter}>افزودن مرکز نیکوکاری</Button>
                </div>
                <div className="px-4 mb-4">
                    <Input
                        prefix={<HiSearch className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو بر اساس نام، شهر، حوزه فعالیت..."
                        className="w-full"
                    />
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-60"><Spinner size={40} /></div>
                    ) : charityCenters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                            <p className="mb-2">{debouncedSearchQuery ? 'موردی یافت نشد.' : 'هیچ مرکزی ثبت نشده است.'}</p>
                            {debouncedSearchQuery ? (
                                <Button variant="plain" onClick={() => setSearchQuery('')}>پاک کردن جستجو</Button>
                            ) : (
                                <Button variant="solid" onClick={handleAddCenter}>افزودن مرکز نیکوکاری</Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-500">نمایش {charityCenters.length} مرکز از مجموع {totalItems} مرکز</div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-right p-3 border-b">نام مرکز</th>
                                            <th className="text-right p-3 border-b">حوزه فعالیت</th>
                                            <th className="text-right p-3 border-b">شهر</th>
                                            <th className="text-right p-3 border-b">استان</th>
                                            <th className="text-right p-3 border-b">تلفن</th>
                                            <th className="text-right p-3 border-b">وضعیت</th>
                                            <th className="text-right p-3 border-b">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {charityCenters.map((center) => (
                                            <tr key={center.id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b font-medium">{center.name}</td>
                                                <td className="p-3 border-b">{center.mainActivityArea}</td>
                                                <td className="p-3 border-b">{center.city}</td>
                                                <td className="p-3 border-b">{center.state}</td>
                                                <td className="p-3 border-b font-mono">{center.phoneNumber}</td>
                                                <td className="p-3 border-b">{center.status}</td>
                                                <td className="p-3 border-b">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="plain" icon={<HiOutlineEye />} onClick={() => handleView(center)} title="مشاهده" />
                                                        <Button size="sm" variant="plain" icon={<HiOutlinePencil className="text-blue-600"/>} onClick={() => handleEdit(center)} title="ویرایش" />
                                                        <Button size="sm" variant="plain" icon={<HiOutlineTrash className="text-red-600"/>} onClick={() => handleDeleteClick(center)} title="حذف" />
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
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
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
                <h5 className="mb-4">تایید حذف</h5>
                <p>آیا از حذف مرکز <span className="font-semibold">"{centerToDelete?.name}"</span> اطمینان دارید؟</p>
                <div className="text-right mt-6">
                    <Button className="mr-2" variant="plain" onClick={() => setDeleteConfirmOpen(false)}>انصراف</Button>
                    <Button variant="solid" color="red" onClick={handleDeleteConfirm}>حذف</Button>
                </div>
            </Dialog>
        </div>
    );
};

export default CharityCenterList;