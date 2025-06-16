'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ExpenseData = {
  amount: number;
  created_at: string;
  category: string;
};

type ChartData = {
  period: string;
  total: number;
};

export default function ExpenseChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, created_at, category');

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      const filteredData = categoryFilter === 'all'
        ? data
        : data!.filter((expense: ExpenseData) => expense.category === categoryFilter);

      const summary: Record<string, number> = {};

      filteredData!.forEach((expense: ExpenseData) => {
        const date = new Date(expense.created_at);

        let key: string;
        if (view === 'monthly') {
          key = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Jun 2025"
        } else {
          // Weekly - get year & week number
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil((((+date - +firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
          key = `Week ${weekNumber} - ${date.getFullYear()}`;
        }

        summary[key] = (summary[key] || 0) + expense.amount;
      });

      const chartData: ChartData[] = Object.keys(summary).map((period) => ({
        period,
        total: summary[period],
      })).sort((a, b) => a.period.localeCompare(b.period));

      setData(chartData);
    };

    fetchData();
  }, [view, categoryFilter]);

  return (
    <div className="space-y-4">
      {/* Toggle for Monthly / Weekly */}
      <ToggleGroup type="single" value={view} onValueChange={(value) => setView(value as 'monthly' | 'weekly')}>
        <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
        <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
      </ToggleGroup>

      {/* Category Filter */}
      <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Food">Food</SelectItem>
          <SelectItem value="Transport">Transport</SelectItem>
          <SelectItem value="Entertainment">Entertainment</SelectItem>
        </SelectContent>
      </Select>

      {/* Bar Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="period" tick={{ fill: '#4B5563', fontSize: 12 }} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', color: 'white' }}
              itemStyle={{ color: 'white' }}
            />
            <Legend />
            <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
