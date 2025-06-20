'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton'; // Shadcn Skeleton

type Transaction = { amount: number; created_at: string };

export default function CategoryCharts() {
  const supabase = createClientComponentClient();
  const [incomeData, setIncomeData] = useState<{ date: string; amount: number }[]>([]);
  const [expenseData, setExpenseData] = useState<{ date: string; amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User fetch error:", userError);
        setIsLoading(false);
        return;
      }

      const userId = user.id;

      const { data: incomes, error: incomeErr } = await supabase
        .from("incomes")
        .select("amount, created_at")
        .eq("user_id", userId);

      const { data: expenses, error: expenseErr } = await supabase
        .from("expenses")
        .select("amount, created_at")
        .eq("user_id", userId);

      if (incomeErr || expenseErr) {
        console.error("Fetch error:", incomeErr || expenseErr);
        setIsLoading(false);
        return;
      }

      if (incomes) {
        const formattedIncome = incomes.map((item: Transaction) => ({
          date: new Date(item.created_at).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
          }),
          amount: item.amount
        }));
        setIncomeData(formattedIncome);
      }

      if (expenses) {
        const formattedExpenses = expenses.map((item: Transaction) => ({
          date: new Date(item.created_at).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
          }),
          amount: item.amount
        }));
        setExpenseData(formattedExpenses);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Income Chart */}
      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-sm rounded-2xl p-6 border border-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-center mb-4">
          Income (₹)
        </h2>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: '1px solid #ddd' }}
                formatter={(value: number) => [`₹ ${value}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expense Chart */}
      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-sm rounded-2xl p-6 border border-gradient-to-r from-red-400 via-rose-400 to-pink-400">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600 text-center mb-4">
          Expenses (₹)
        </h2>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={expenseData}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: '1px solid #ddd' }}
                formatter={(value: number) => [`₹ ${value}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
