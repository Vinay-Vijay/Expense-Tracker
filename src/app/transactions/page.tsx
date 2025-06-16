'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAmount, setEditAmount] = useState(0);
    const [editCategory, setEditCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortField, setSortField] = useState<'created_at' | 'amount'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 6;

    const supabase = createClientComponentClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const type = searchParams.get('type') as 'All' | 'Income' | 'Expense';
        const search = searchParams.get('search') || '';
        const start = searchParams.get('start') || '';
        const end = searchParams.get('end') || '';
        const sort = searchParams.get('sort') as 'created_at' | 'amount';
        const order = searchParams.get('order') as 'asc' | 'desc';

        if (type) setFilterType(type);
        if (search) setSearchTerm(search);
        if (start) setStartDate(start);
        if (end) setEndDate(end);
        if (sort) setSortField(sort);
        if (order) setSortOrder(order);
    }, [searchParams]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const { data: expenses } = await supabase.from('expenses').select('*');
            const { data: incomes } = await supabase.from('incomes').select('*');
            const expenseTransactions = (expenses || []).map((exp) => ({ ...exp, type: 'Expense' }));
            const incomeTransactions = (incomes || []).map((inc) => ({ ...inc, type: 'Income' }));
            const allTransactions = [...expenseTransactions, ...incomeTransactions];
            allTransactions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setTransactions(allTransactions);
        };
        fetchTransactions();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filterType !== 'All') params.set('type', filterType);
        if (searchTerm) params.set('search', searchTerm);
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        if (sortField !== 'created_at') params.set('sort', sortField);
        if (sortOrder !== 'desc') params.set('order', sortOrder);
        router.replace(`/transactions?${params.toString()}`);
    }, [filterType, searchTerm, startDate, endDate, sortField, sortOrder]);

    const handleDelete = async (tx: Transaction) => {
        const table = tx.type === 'Income' ? 'incomes' : 'expenses';
        await supabase.from(table).delete().eq('id', tx.id);
        window.location.reload();
    };

    const openEditDialog = (tx: Transaction) => {
        setEditingTransaction(tx);
        setEditTitle(tx.title);
        setEditAmount(tx.amount);
        setEditCategory(tx.category);
    };

    const handleEditSaveWithId = async (tx: Transaction) => {
        const table = tx.type === 'Income' ? 'incomes' : 'expenses';
        await supabase.from(table).update({
            title: editTitle,
            amount: editAmount,
            category: editCategory,
        }).eq('id', tx.id);
        window.location.reload();
    };

    const filteredTransactions = transactions.filter((tx) => {
        const matchesType = filterType === 'All' || tx.type === filterType;
        const title = tx.title?.toLowerCase() || '';
        const category = tx.category?.toLowerCase() || '';
        const matchesSearch = title.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase());
        const txDate = new Date(tx.created_at);
        const afterStart = startDate ? txDate >= new Date(startDate) : true;
        const beforeEnd = endDate ? txDate <= new Date(endDate) : true;
        return matchesType && matchesSearch && afterStart && beforeEnd;
    }).sort((a, b) => {
        if (sortField === 'created_at') {
            return sortOrder === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterType('All');
        setStartDate('');
        setEndDate('');
        setSortField('created_at');
        setSortOrder('desc');
    };

    return (
        <div className="p-6 space-y-4 pb-20 bg-background text-foreground min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Home</Button>
                    <h2 className="text-2xl font-bold">All Transactions</h2>
                </div>
                <div className="flex space-x-4 items-center">
                    <Input placeholder="Search title/category" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[350px]" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Filters</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-4 space-y-4 w-[300px]">
                            <div className="space-y-2">
                                <DropdownMenuLabel>Type</DropdownMenuLabel>
                                <Select value={filterType} onValueChange={(val) => setFilterType(val as 'All' | 'Income' | 'Expense')}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Filter Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All</SelectItem>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                <Select value={sortField} onValueChange={(val) => setSortField(val as 'created_at' | 'amount')}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Date</SelectItem>
                                        <SelectItem value="amount">Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                        <SelectItem value="desc">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button variant="destructive" onClick={resetFilters}>Reset Filters</Button>
                        </DropdownMenuContent>

                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTransactions.map((tx) => (
                    <Card key={tx.id} className="bg-card text-card-foreground">
                        <CardHeader>
                            <CardTitle className={tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}>{tx.type}: {tx.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>Amount: ₹ {tx.amount}</p>
                            <p>Category: {tx.category}</p>
                            <p>Added: {new Date(tx.created_at).toLocaleString()}</p>
                            <p>Last Updated: {new Date(tx.updated_at).toLocaleString()}</p>
                            <div className="flex space-x-2 pt-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => openEditDialog(tx)}>Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent className="space-y-4">
                                        <DialogTitle>Edit {tx.type}</DialogTitle>
                                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                                        <Input type="number" value={editAmount} onChange={(e) => setEditAmount(Number(e.target.value))} placeholder="Amount" />
                                        <Select value={editCategory} onValueChange={setEditCategory}>
                                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                            <SelectContent>
                                                {tx.type === 'Income' ? (
                                                    <>
                                                        <SelectItem value="Salary">Salary</SelectItem>
                                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                                        <SelectItem value="Investments">Investments</SelectItem>
                                                        <SelectItem value="Gifts">Gifts</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <SelectItem value="Food">Food</SelectItem>
                                                        <SelectItem value="Transport">Transport</SelectItem>
                                                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                                        <SelectItem value="Health">Health</SelectItem>
                                                        <SelectItem value="Utilities">Utilities</SelectItem>
                                                        <SelectItem value="Travel">Travel</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex justify-end">
                                            <Button onClick={() => handleEditSaveWithId(tx)}>Save</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(tx)}>Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-background py-4 flex justify-center items-center space-x-4 shadow-md border-t">
                <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
            </div>
        </div>
    );
}