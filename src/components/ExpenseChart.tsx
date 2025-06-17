'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCategory } from '@/context/CategoryContext';

type DataItem = {
  amount: number;
  created_at: string;
  category: string;
};

type ChartData = {
  period: string;
  Income: number;
  Expense: number;
};

export default function ExpenseChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const { category } = useCategory();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount, created_at, category');

      const { data: incomes, error: incomeError } = await supabase
        .from('incomes')
        .select('amount, created_at, category');

      if (expenseError || incomeError) {
        console.error('Error fetching data:', expenseError || incomeError);
        return;
      }

      const filterData = (data: DataItem[]) => {
        return category === 'all'
          ? data
          : data.filter((item) => item.category === category);
      };

      const filteredExpenses = filterData(expenses!);
      const filteredIncomes = filterData(incomes!);

      const summary: Record<string, { Income: number; Expense: number }> = {};

      // Summarize Expenses
      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.created_at);
        let key: string;
        if (view === 'monthly') {
          key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else {
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil((((+date - +firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
          key = `Week ${weekNumber} - ${date.getFullYear()}`;
        }
        if (!summary[key]) summary[key] = { Income: 0, Expense: 0 };
        summary[key].Expense += expense.amount;
      });

      // Summarize Incomes
      filteredIncomes.forEach((income) => {
        const date = new Date(income.created_at);
        let key: string;
        if (view === 'monthly') {
          key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else {
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil((((+date - +firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
          key = `Week ${weekNumber} - ${date.getFullYear()}`;
        }
        if (!summary[key]) summary[key] = { Income: 0, Expense: 0 };
        summary[key].Income += income.amount;
      });

      const chartData: ChartData[] = Object.keys(summary).map((period) => ({
        period,
        Income: summary[period].Income,
        Expense: summary[period].Expense,
      })).sort((a, b) => a.period.localeCompare(b.period));

      setData(chartData.length === 0 ? [{ period: 'No Data', Income: 0, Expense: 0 }] : chartData);
    };

    fetchData();
  }, [view, category, supabase]);

  return (
    <div className="space-y-4">
      {/* Toggle for Monthly / Weekly */}
      <div className="flex justify-end">
        <ToggleGroup type="single" value={view} onValueChange={(value) => setView(value as 'monthly' | 'weekly')}>
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
