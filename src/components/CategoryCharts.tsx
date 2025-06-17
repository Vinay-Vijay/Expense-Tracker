'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Expense = { amount: number; category: string; };
type Income = { amount: number; category: string; };

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];
const dummyData = [{ name: 'No Data', value: 1 }]; // placeholder if no data

export default function CategoryCharts() {
  const supabase = createClientComponentClient();
  const [expenseData, setExpenseData] = useState<{ name: string; value: number }[]>([]);
  const [incomeData, setIncomeData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      const { data: expenses } = await supabase.from('expenses').select('amount, category');
      const { data: incomes } = await supabase.from('incomes').select('amount, category');

      if (expenses) {
        const expenseSummary: Record<string, number> = {};
        expenses.forEach((exp: Expense) => {
          expenseSummary[exp.category] = (expenseSummary[exp.category] || 0) + exp.amount;
        });
        const expenseChart = Object.keys(expenseSummary).map(key => ({
          name: key,
          value: expenseSummary[key],
        }));
        setExpenseData(expenseChart.length > 0 ? expenseChart : dummyData);
      }

      if (incomes) {
        const incomeSummary: Record<string, number> = {};
        incomes.forEach((inc: Income) => {
          incomeSummary[inc.category] = (incomeSummary[inc.category] || 0) + inc.amount;
        });
        const incomeChart = Object.keys(incomeSummary).map(key => ({
          name: key,
          value: incomeSummary[key],
        }));
        setIncomeData(incomeChart.length > 0 ? incomeChart : dummyData);
      }
    };

    fetchCategoryData();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Expense by Category */}
      <div className="w-full h-[300px]">
        <h2 className="text-center font-semibold mb-2">Expenses by Category</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {expenseData.map((_, index) => (
                <Cell key={`cell-exp-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Income by Category */}
      <div className="w-full h-[300px]">
        <h2 className="text-center font-semibold mb-2">Incomes by Category</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={incomeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#82ca9d"
              label
            >
              {incomeData.map((_, index) => (
                <Cell key={`cell-inc-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
