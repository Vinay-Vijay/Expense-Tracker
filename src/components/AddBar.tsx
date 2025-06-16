'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GreetingBar({ user }: { user: string | null }) {
  const supabase = createClientComponentClient();

  // Income state
  const [openIncome, setOpenIncome] = useState(false);
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');

  // Expense state
  const [openExpense, setOpenExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');

  const handleAddIncome = async () => {
    const { error } = await supabase.from('incomes').insert([
      { title: incomeTitle, amount: parseFloat(incomeAmount), category: incomeCategory }
    ]);
    if (error) alert(error.message);
    else window.location.reload();
  };


  const handleAddExpense = async () => {
    const { error } = await supabase.from('expenses').insert([
      { title: expenseTitle, amount: parseFloat(expenseAmount), category: expenseCategory }
    ]);
    if (error) alert(error.message);
    else window.location.reload();
  };

  return (
    <div className="w-full flex justify-between items-center p-4 bg-background rounded-lg shadow-sm">
      {/* Left: Greeting */}
      <h2 className="text-2xl font-bold">Hello, {user || "Guest"} 👋</h2>

      {/* Right: Buttons */}
      <div className="flex space-x-4">
        {/* New Income */}
        <Dialog open={openIncome} onOpenChange={setOpenIncome}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">New Income</Button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={incomeTitle} onChange={(e) => setIncomeTitle(e.target.value)} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={incomeCategory} onValueChange={setIncomeCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Income Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Investments">Investments</SelectItem>
                  <SelectItem value="Gifts">Gifts</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddIncome}>Add Income</Button>
          </DialogContent>

        </Dialog>

        {/* New Expense */}
        <Dialog open={openExpense} onOpenChange={setOpenExpense}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">New Expense</Button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
