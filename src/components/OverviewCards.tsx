'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function OverviewCards() {
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      const userId = user.id;

      // Fetch Incomes for this user only
      const { data: incomes, error: incomeError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', userId);

      // Fetch Expenses for this user only
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId);

      if (!incomeError && incomes) {
        const incomeSum = incomes.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
        setIncomeTotal(incomeSum);
      } else {
        console.error('Error fetching incomes:', incomeError);
      }

      if (!expenseError && expenses) {
        const expenseSum = expenses.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
        setExpenseTotal(expenseSum);
      } else {
        console.error('Error fetching expenses:', expenseError);
      }
    };

    fetchData();
  }, [supabase]);

  const balance = incomeTotal - expenseTotal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₹ {incomeTotal.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₹ {expenseTotal.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₹ {balance.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
