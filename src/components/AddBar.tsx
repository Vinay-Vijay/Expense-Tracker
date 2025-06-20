'use client';

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AddBar() {
  const supabase = createClientComponentClient();
  const [fullName, setFullName] = useState<string>('Loading...');

  // Income state
  const [openIncome, setOpenIncome] = useState(false);
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');
  const [incomeError, setIncomeError] = useState<string>('');

  // Expense state
  const [openExpense, setOpenExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseError, setExpenseError] = useState<string>('');

  useEffect(() => {
    const fetchFullName = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setFullName('Guest');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching full name:', error);
        setFullName('Guest');
      } else {
        setFullName(data?.full_name || 'Guest');
      }
    };

    fetchFullName();
  }, [supabase]);

  const handleAddIncome = async () => {
    if (!incomeTitle.trim() || !incomeAmount || !incomeCategory) {
      setIncomeError('All fields are required for Income.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('incomes').insert([
      {
        title: incomeTitle,
        amount: parseFloat(incomeAmount),
        category: incomeCategory,
        user_id: user?.id
      }
    ]);

    if (error) {
      setIncomeError(error.message);
    } else {
      setIncomeError('');
      window.location.reload();
    }
  };

  const handleAddExpense = async () => {
    if (!expenseTitle.trim() || !expenseAmount || !expenseCategory) {
      setExpenseError('All fields are required for Expense.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('expenses').insert([
      {
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        user_id: user?.id
      }
    ]);

    if (error) {
      setExpenseError(error.message);
    } else {
      setExpenseError('');
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-6 rounded-2xl 
      bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl border 
      border-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">

      <h2 className="text-2xl font-bold bg-clip-text text-transparent 
        bg-gradient-to-r from-blue-600 to-indigo-600">
        Hello, {fullName || "Guest"} 👋
      </h2>

      <div className="flex space-x-4">
        {/* New Income Dialog */}
        <Dialog open={openIncome} onOpenChange={setOpenIncome}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-400 to-green-600 text-white
              hover:from-green-500 hover:to-green-700 transition-all shadow-md">
              New Income
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] space-y-4
        bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg
        dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <DialogTitle className="text-gray-800 dark:text-white">New Income</DialogTitle>
            {/* You might want a DialogDescription here too for consistency if the edit dialog has one */}
            {/* <DialogDescription className="text-gray-600 dark:text-gray-300">
            Add a new income transaction here.
        </DialogDescription> */}

            <div className="grid gap-4 py-4"> {/* Added grid layout similar to edit dialog */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="income-title" className="text-gray-700 text-right dark:text-gray-300">Title</Label>
                <Input
                  id="income-title"
                  value={incomeTitle}
                  onChange={(e) => setIncomeTitle(e.target.value)}
                  className="col-span-3 bg-white border border-gray-300 text-gray-900
                               dark:bg-gray-700 dark:border-gray-600 dark:text-white
                               focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="income-amount" className="text-gray-700 text-right dark:text-gray-300">Amount</Label>
                <Input
                  id="income-amount"
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="col-span-3 bg-white border border-gray-300 text-gray-900
                               dark:bg-gray-700 dark:border-gray-600 dark:text-white
                               focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="income-category" className="text-gray-700 text-right dark:text-gray-300">Category</Label>
                <Select value={incomeCategory} onValueChange={setIncomeCategory}>
                  <SelectTrigger id="income-category" className="col-span-3
                        bg-white border border-gray-300 text-gray-900
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select Income Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-gray-900
                                          dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investments">Investments</SelectItem>
                    <SelectItem value="Gifts">Gifts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {incomeError && <p className="text-red-500 text-sm">{incomeError}</p>}

            <DialogFooter> {/* Added DialogFooter for consistent button placement */}
              <Button
                onClick={handleAddIncome}
                disabled={!incomeTitle.trim() || !incomeAmount || !incomeCategory}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
              >
                Add Income
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Expense Dialog */}
        <Dialog open={openExpense} onOpenChange={setOpenExpense}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-400 to-red-600 text-white
              hover:from-red-500 hover:to-red-700 transition-all shadow-md">
              New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] space-y-4
        bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg
        dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <DialogTitle className="text-gray-800 dark:text-white">New Expense</DialogTitle>
            {/* You might want a DialogDescription here too for consistency if the edit dialog has one */}
            {/* <DialogDescription className="text-gray-600 dark:text-gray-300">
            Add a new expense transaction here.
        </DialogDescription> */}

            <div className="grid gap-4 py-4"> {/* Added grid layout similar to edit dialog */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-title" className="text-gray-700 text-right dark:text-gray-300">Title</Label>
                <Input
                  id="expense-title"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="col-span-3 bg-white border border-gray-300 text-gray-900
                               dark:bg-gray-700 dark:border-gray-600 dark:text-white
                               focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-amount" className="text-gray-700 text-right dark:text-gray-300">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="col-span-3 bg-white border border-gray-300 text-gray-900
                               dark:bg-gray-700 dark:border-gray-600 dark:text-white
                               focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-category" className="text-gray-700 text-right dark:text-gray-300">Category</Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger id="expense-category" className="col-span-3
                        bg-white border border-gray-300 text-gray-900
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select Expense Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-gray-900
                                          dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    {/* If the edit dialog has 'Education' and 'Rent', add them here for consistency */}
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {expenseError && <p className="text-red-500 text-sm">{expenseError}</p>}

            <DialogFooter> {/* Added DialogFooter for consistent button placement */}
              <Button
                onClick={handleAddExpense}
                disabled={!expenseTitle.trim() || !expenseAmount || !expenseCategory}
                className="w-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white"
              >
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
