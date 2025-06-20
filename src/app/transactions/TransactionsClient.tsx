'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Navbar from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

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
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editCategory, setEditCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL params only once at mount
  useEffect(() => {
    const type = searchParams.get('type') as 'All' | 'Income' | 'Expense';
    const search = searchParams.get('search') || '';
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';
    const sort = searchParams.get('sort') as 'created_at' | 'amount';
    const order = searchParams.get('order') as 'asc' | 'desc';

    setFilterType(type || 'All');
    setSearchTerm(search);
    setStartDate(start);
    setEndDate(end);
    setSortField(sort || 'created_at');
    setSortOrder(order || 'desc');
  }, []);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/');
        return;
      }

      const userId = user.id;
      const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', userId);
      const { data: incomes } = await supabase.from('incomes').select('*').eq('user_id', userId);

      const allTransactions = [
        ...(expenses || []).map((exp) => ({ ...exp, type: 'Expense' })),
        ...(incomes || []).map((inc) => ({ ...inc, type: 'Income' }))
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setTransactions(allTransactions);
      setIsLoading(false);
    };
    fetchTransactions();
  }, []);

  // Update URL params on state change
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filterType !== 'All') params.set('type', filterType);
    if (searchTerm) params.set('search', searchTerm);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (sortField !== 'created_at') params.set('sort', sortField);
    if (sortOrder !== 'desc') params.set('order', sortOrder);

    router.replace(`${pathname}?${params.toString()}`);
  }, [filterType, searchTerm, startDate, endDate, sortField, sortOrder, pathname, router]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Handle delete
  const handleDelete = async () => {
    if (!transactionToDelete) return;
    const table = transactionToDelete.type === 'Income' ? 'incomes' : 'expenses';
    await supabase.from(table).delete().eq('id', transactionToDelete.id);
    setTransactions(prev => prev.filter(tx => tx.id !== transactionToDelete.id));
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  // Handle edit
  const openEditDialog = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount);
    setEditCategory(tx.category);
  };

  const confirmEditSave = async () => {
    if (!transactionToEdit) return;
    const table = transactionToEdit.type === 'Income' ? 'incomes' : 'expenses';
    const { data } = await supabase.from(table).update({
      title: editTitle,
      amount: editAmount,
      category: editCategory,
      updated_at: new Date().toISOString()
    }).eq('id', transactionToEdit.id).select().single();

    if (data) {
      setTransactions(prev => prev.map(tx => tx.id === data.id ? { ...data, type: transactionToEdit.type } : tx));
    }
    setTransactionToEdit(null);
  };

  // Filter + Sort + Pagination logic
  const filteredAndSortedTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'All' || tx.type === filterType;
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const afterStart = !startDate || new Date(tx.created_at) >= new Date(startDate);
    const beforeEnd = !endDate || new Date(tx.created_at) <= new Date(endDate);
    return matchesType && matchesSearch && afterStart && beforeEnd;
  }).sort((a, b) => {
    if (sortField === 'created_at') return sortOrder === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
  });

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage === 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('All');
    setStartDate('');
    setEndDate('');
    setSortField('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-foreground">
            {/* Header / Navbar fixed at the top */}
            <div className="fixed top-0 left-0 w-full z-20 bg-white dark:bg-gray-950 shadow-md border-b border-gray-200 dark:border-gray-800">
                <Navbar user={null} />
            </div>

            {/* Main content taking the rest of the available space, with padding for the fixed header */}
            <main className="flex-grow flex items-start justify-center p-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    {/* Main content card (Dashboard style) */}
                    <Card className="bg-white/90 dark:bg-black/30 backdrop-blur-md shadow-xl rounded-2xl border dark:border-gradient-to-r dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400">
                        <CardHeader className="text-center mb-6">
                            <CardTitle className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">All Transactions</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-8">
                            {/* Filters and Search */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <Input
                                    placeholder="Search by title or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-[350px] rounded-md shadow-sm bg-white border border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full md:w-[150px] rounded-md shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
                                            Filters
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="p-4 space-y-4 w-[300px] bg-white rounded-md shadow-lg border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                        {/* Type Filter */}
                                        <div className="space-y-2">
                                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Type</DropdownMenuLabel>
                                            <Select value={filterType} onValueChange={(val) => { setFilterType(val as 'All' | 'Income' | 'Expense'); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Filter Type" /></SelectTrigger>
                                                <SelectContent className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                    <SelectItem value="All">All</SelectItem>
                                                    <SelectItem value="Income">Income</SelectItem>
                                                    <SelectItem value="Expense">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Date Range Filter */}
                                        <div className="space-y-2">
                                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Date Range</DropdownMenuLabel>
                                            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        {/* Sort Filter */}
                                        <div className="space-y-2">
                                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Sort By</DropdownMenuLabel>
                                            <Select value={sortField} onValueChange={(val) => { setSortField(val as 'created_at' | 'amount'); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                    <SelectItem value="created_at">Date</SelectItem>
                                                    <SelectItem value="amount">Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={sortOrder} onValueChange={(val) => { setSortOrder(val as 'asc' | 'desc'); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                    <SelectItem value="asc">Ascending</SelectItem>
                                                    <SelectItem value="desc">Descending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button variant="outline" onClick={resetFilters} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 rounded-md">Reset Filters</Button>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Loading State / Progress Bar */}
                            {isLoading ? (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-8 overflow-hidden dark:bg-gray-700">
                                    <motion.div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    ></motion.div>
                                </div>
                            ) : filteredAndSortedTransactions.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20 p-8 bg-gray-100 rounded-lg shadow-inner border border-gray-200 dark:text-gray-400 dark:bg-black/50 dark:border-gray-700">
                                    <p className="text-xl font-semibold mb-2">No transactions found.</p>
                                    <p className="text-md">Try adjusting your filters or add a new transaction.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedTransactions.map((tx, idx) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08, duration: 0.3 }}
                                        >
                                            <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 dark:bg-black/50 dark:border-gray-700">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className={`text-xl font-semibold ${tx.type === 'Income' ? 'bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text' : 'bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text'}`}>
                                                        {tx.title}
                                                    </CardTitle>
                                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${tx.type === 'Income' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>
                                                        {tx.type}
                                                    </span>
                                                </CardHeader>
                                                <CardContent className="space-y-1 text-gray-800 dark:text-gray-300">
                                                    <p className="text-xl font-bold">₹ {tx.amount.toLocaleString('en-IN')}</p>
                                                    <p className="text-sm">Category: <span className="font-medium">{tx.category}</span></p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Added: {new Date(tx.created_at).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated: {new Date(tx.updated_at).toLocaleString()}</p>
                                                    <div className="flex justify-end space-x-2 pt-4">
                                                        <Dialog onOpenChange={(isOpen) => !isOpen && setTransactionToEdit(null)}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                                                    onClick={() => openEditDialog(tx)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                                <DialogTitle className="text-gray-800 dark:text-white">Edit {tx.type}</DialogTitle>
                                                                <DialogDescription className="text-gray-600 dark:text-gray-300">
                                                                    Make changes to your transaction here. Click save when you&apos;re done.
                                                                </DialogDescription>
                                                                <div className="grid gap-4 py-4">
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <label htmlFor="edit-title" className="text-gray-700 text-right dark:text-gray-300">Title</label>
                                                                        <Input
                                                                            id="edit-title"
                                                                            value={editTitle}
                                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                                            className="col-span-3 bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <label htmlFor="edit-amount" className="text-gray-700 text-right dark:text-gray-300">Amount</label>
                                                                        <Input
                                                                            id="edit-amount"
                                                                            type="number"
                                                                            value={editAmount}
                                                                            onChange={(e) => setEditAmount(Number(e.target.value))}
                                                                            className="col-span-3 bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <label htmlFor="edit-category" className="text-gray-700 text-right dark:text-gray-300">Category</label>
                                                                        <Select value={editCategory} onValueChange={setEditCategory}>
                                                                            <SelectTrigger id="edit-category" className="col-span-3 bg-white border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                                                <SelectValue placeholder="Select Category" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                                                {tx.type === 'Income' ? (
                                                                                    ["Salary", "Freelance", "Investments", "Gifts", "Other"].map(cat => (
                                                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                                                    ))
                                                                                ) : (
                                                                                    ["Food", "Transport", "Entertainment", "Shopping", "Health", "Utilities", "Travel", "Education", "Rent"].map(cat => (
                                                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                                                    ))
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button onClick={confirmEditSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md">Save changes</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="bg-red-600 hover:bg-red-700 text-white rounded-md dark:bg-red-800 dark:hover:bg-red-900 dark:text-gray-200"
                                                            onClick={() => { setTransactionToDelete(tx); setDeleteDialogOpen(true); }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <DialogTitle className="text-gray-800 dark:text-white">Confirm Deletion</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pagination Controls - Fixed at bottom */}
            {filteredAndSortedTransactions.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full z-20 bg-white py-3 flex justify-center items-center space-x-3 shadow-top border-t border-gray-200 dark:bg-gray-950 dark:border-gray-800">
                    <Button
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                    >
                        Previous
                    </Button>
                    <span className="text-gray-700 text-xs font-semibold dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}