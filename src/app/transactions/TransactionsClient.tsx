'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Navbar from '../../components/SideBar';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton"; // Import the Skeleton component

type Transaction = {
    id: string;
    title: string;
    amount: number;
    category: string;
    type: 'Income' | 'Expense';
    created_at: string;
    updated_at: string;
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [sortField, setSortField] = useState<'created_at' | 'amount'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);

    const [editTitle, setEditTitle] = useState('');
    const [editAmount, setEditAmount] = useState(0);
    const [editCategory, setEditCategory] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [editConfirmDialogOpen, setEditConfirmDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const itemsPerPage = 6;
    const supabase = createClientComponentClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const getUTCDate = (date: Date): Date => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    useEffect(() => {
        const type = searchParams.get('type') as 'All' | 'Income' | 'Expense';
        const search = searchParams.get('search') || '';
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const sort = searchParams.get('sort') as 'created_at' | 'amount';
        const order = searchParams.get('order') as 'asc' | 'desc';

        setFilterType(type || 'All');
        setSearchTerm(search);
        setStartDate(start ? getUTCDate(new Date(start)) : undefined);
        setEndDate(end ? getUTCDate(new Date(end)) : undefined);
        setSortField(sort || 'created_at');
        setSortOrder(order || 'desc');
    }, [searchParams]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true); // Start loading
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                setIsLoading(false); // Stop loading if no user
                return;
            }
            const userId = user.id;
            const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', userId);
            const { data: incomes } = await supabase.from('incomes').select('*').eq('user_id', userId);
            const all = [
                ...(expenses || []).map(exp => ({ ...exp, type: 'Expense' as const })),
                ...(incomes || []).map(inc => ({ ...inc, type: 'Income' as const }))
            ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setTransactions(all);
            setIsLoading(false); // Stop loading after data is fetched
        };
        fetchTransactions();
    }, [router, supabase]);

    const updateUrlParams = useCallback(() => {
        const params = new URLSearchParams();
        if (filterType !== 'All') params.set('type', filterType);
        if (searchTerm) params.set('search', searchTerm);
        if (startDate) params.set('start', format(startDate, 'yyyy-MM-dd'));
        if (endDate) params.set('end', format(endDate, 'yyyy-MM-dd'));
        if (sortField !== 'created_at') params.set('sort', sortField);
        if (sortOrder !== 'desc') params.set('order', sortOrder);
        router.replace(`${pathname}?${params.toString()}`);
    }, [filterType, searchTerm, startDate, endDate, sortField, sortOrder, pathname, router]);

    useEffect(() => { updateUrlParams(); }, [updateUrlParams]);

    const handleDelete = async () => {
        if (!transactionToDelete) return;
        const table = transactionToDelete.type === 'Income' ? 'incomes' : 'expenses';
        await supabase.from(table).delete().eq('id', transactionToDelete.id);
        setTransactions(prev => prev.filter(tx => tx.id !== transactionToDelete.id));
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
    };

    const openEditDialog = (tx: Transaction) => {
        setTransactionToEdit(tx);
        setEditTitle(tx.title);
        setEditAmount(tx.amount);
        setEditCategory(tx.category);
        setIsEditDialogOpen(true);
    };

    const handleConfirmEdit = () => { setEditConfirmDialogOpen(true); };

    const confirmEditSave = async () => {
        if (!transactionToEdit) return;
        const table = transactionToEdit.type === 'Income' ? 'incomes' : 'expenses';
        const { data, error } = await supabase.from(table).update({
            title: editTitle, amount: editAmount, category: editCategory, updated_at: new Date().toISOString()
        }).eq('id', transactionToEdit.id).select().single();

        if (!error && data) {
            setTransactions(prev => prev.map(tx =>
                tx.id === data.id ? { ...transactionToEdit, title: data.title, amount: data.amount, category: data.category, updated_at: data.updated_at } : tx
            ));
        }
        setTransactionToEdit(null);
        setEditConfirmDialogOpen(false);
        setIsEditDialogOpen(false);
    };

    const filteredAndSortedTransactions = transactions.filter((tx) => {
        const matchesType = filterType === 'All' || tx.type === filterType;
        const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
        const txDate = getUTCDate(new Date(tx.created_at));
        const afterStart = !startDate || txDate >= getUTCDate(startDate);
        const beforeEnd = !endDate || txDate <= getUTCDate(endDate);
        return matchesType && matchesSearch && afterStart && beforeEnd;
    }).sort((a, b) => {
        if (sortField === 'created_at') return sortOrder === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    });

    const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage) || 1;
    useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterType('All');
        setStartDate(undefined);
        setEndDate(undefined);
        setSortField('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            <Navbar user={null} />
            <main className="flex-grow flex justify-center p-4 pt-20">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/30 dark:bg-black/30 backdrop-blur-md p-4 rounded-xl shadow-md border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                        {/* Search */}
                        <Input
                            placeholder="Search by title or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-[300px] bg-white/50 dark:bg-black/50"
                        />

                        {/* Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="bg-white/30 dark:bg-black/30 backdrop-blur-md">
                                    Filter & Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-4 space-y-4 w-64 bg-white/30 dark:bg-black/30 backdrop-blur-md border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                                {/* Type */}
                                <div>
                                    <DropdownMenuLabel>Type</DropdownMenuLabel>
                                    <Select value={filterType} onValueChange={(val) => setFilterType(val as 'All' | 'Income' | 'Expense')}>
                                        <SelectTrigger className="w-full bg-white/20 dark:bg-black/20">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All</SelectItem>
                                            <SelectItem value="Income">Income</SelectItem>
                                            <SelectItem value="Expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full bg-white/20 dark:bg-black/20">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : 'Start Date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full bg-white/20 dark:bg-black/20">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : 'End Date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                    <Select value={sortField} onValueChange={(val) => setSortField(val as 'created_at' | 'amount')}>
                                        <SelectTrigger className="w-full bg-white/20 dark:bg-black/20">
                                            <SelectValue placeholder="Sort Field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at">Date</SelectItem>
                                            <SelectItem value="amount">Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}>
                                        <SelectTrigger className="w-full mt-2 bg-white/20 dark:bg-black/20">
                                            <SelectValue placeholder="Sort Order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                            <SelectItem value="desc">Descending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Reset Filters */}
                                <Button variant="outline" className="w-full bg-white/20 dark:bg-black/20" onClick={resetFilters}>
                                    Reset Filters
                                </Button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Transactions List or Skeleton */}
                    <div className="overflow-y-auto space-y-4 pr-2">
                        {isLoading ? (
                            // Render multiple shadcn Skeleton loaders while loading
                            Array.from({ length: itemsPerPage }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-white/30 dark:bg-black/30 backdrop-blur-md p-4 rounded-xl shadow-md border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
                                >
                                    <Skeleton className="w-6 h-6 rounded-full" /> {/* Icon placeholder */}
                                    <div className="flex-1 mx-4 space-y-2">
                                        <Skeleton className="h-4 w-3/4 rounded" /> {/* Title placeholder */}
                                        <div className="flex space-x-4">
                                            <Skeleton className="h-3 w-1/4 rounded" /> {/* Category placeholder */}
                                            <Skeleton className="h-3 w-1/4 rounded" /> {/* Date placeholder */}
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded" /> {/* Amount placeholder */}
                                    <div className="flex space-x-2 ml-4">
                                        <Skeleton className="w-4 h-4 rounded-full" /> {/* Edit icon placeholder */}
                                        <Skeleton className="w-4 h-4 rounded-full" /> {/* Delete icon placeholder */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredAndSortedTransactions.map((tx, idx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex items-center justify-between bg-white/30 dark:bg-black/30 backdrop-blur-md p-4 rounded-xl shadow-md border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
                                >
                                    {/* Icon */}
                                    <div>
                                        {tx.type === 'Income' ? (
                                            <ArrowDownCircle className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <ArrowUpCircle className="w-6 h-6 text-red-500" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 mx-4">
                                        <p className="font-semibold">{tx.title}</p>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-x-4">
                                            <span>{tx.category}</span>
                                            <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <p
                                        className={`font-bold text-lg ${tx.type === 'Income'
                                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text'
                                                : 'bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text'
                                            }`}
                                    >
                                        ₹ {tx.amount.toLocaleString('en-IN')}
                                    </p>

                                    {/* Edit & Delete */}
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => openEditDialog(tx)}
                                            className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setTransactionToDelete(tx);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                         {!isLoading && filteredAndSortedTransactions.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400">No transactions found.</p>
                        )}
                    </div>
                </motion.div>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Modify transaction details below.</DialogDescription>
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <Input
                                placeholder="Amount"
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                            />
                            <Input
                                placeholder="Category"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmEdit}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this transaction?</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Confirmation Dialog */}
            <Dialog open={editConfirmDialogOpen} onOpenChange={setEditConfirmDialogOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Edit</DialogTitle>
                    <DialogDescription>Are you sure you want to save changes?</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditConfirmDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmEditSave}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}