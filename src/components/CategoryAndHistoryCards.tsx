'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";

type Expense = { amount: number; category: string; title: string; created_at: string; };
type Income = { amount: number; title: string; created_at: string; };
type ExpenseWithCount = { category: string; total: number; count: number; };

export default function CategoryAndHistoryCards() {
  const supabase = createClientComponentClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categoryData, setCategoryData] = useState<ExpenseWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setIsLoading(false);
        return;
      }
      const userId = user.id;

      const { data: expenseData } = await supabase
        .from('expenses')
        .select('amount, category, title, created_at')
        .eq('user_id', userId);

      const { data: incomeData } = await supabase
        .from('incomes')
        .select('amount, title, created_at')
        .eq('user_id', userId);

      setExpenses(expenseData || []);
      setIncomes(incomeData || []);

      const summary: Record<string, { total: number; count: number }> = {};
      (expenseData || []).forEach((exp) => {
        if (!summary[exp.category]) summary[exp.category] = { total: 0, count: 0 };
        summary[exp.category].total += exp.amount ?? 0;
        summary[exp.category].count += 1;
      });

      const result: ExpenseWithCount[] = Object.keys(summary).map((key) => ({
        category: key,
        total: summary[key].total,
        count: summary[key].count,
      }));

      setCategoryData(result);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  const totalExpense = expenses.reduce((acc, exp) => acc + (exp.amount ?? 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Categories Card */}
      <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-sm rounded-2xl border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            // Skeleton for categories
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))
          ) : categoryData.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
          ) : (
            categoryData.map((cat, idx) => {
              const percentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{cat.category}</span>
                    <span className="text-gray-600 dark:text-gray-300">₹{cat.total.toFixed(2)}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 rounded-full bg-gray-200 dark:bg-gray-700
                      [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-indigo-600
                      transition-all duration-700 ease-in-out"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cat.count} transaction{cat.count > 1 ? 's' : ''}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* History Card */}
      <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-sm rounded-2xl border border-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            // Skeleton for history
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center space-y-2">
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))
          ) : ([...incomes.map((inc) => ({
            type: 'income',
            title: inc.title,
            amount: inc.amount,
            date: inc.created_at,
          })), ...expenses.map((exp) => ({
            type: 'expense',
            title: exp.title,
            amount: exp.amount,
            date: exp.created_at,
          }))])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <p className={`font-bold text-lg
                  ${item.type === 'income'
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text'
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text'
                  }`}>
                  {item.type === 'income' ? '+' : '-'} ₹{item.amount.toFixed(2)}
                </p>
              </div>
            ))
          }
          {(!isLoading && incomes.length + expenses.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-400">No transaction history yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
