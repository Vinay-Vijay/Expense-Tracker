'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

export default function OverviewCards() {
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      const userId = user.id;

      const { data: incomes, error: incomeError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', userId);

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

  // Animation Springs
  const incomeSpring = useSpring({ val: incomeTotal, from: { val: 0 }, config: { tension: 170, friction: 26 } });
  const expenseSpring = useSpring({ val: expenseTotal, from: { val: 0 }, config: { tension: 170, friction: 26 } });
  const balanceSpring = useSpring({ val: balance, from: { val: 0 }, config: { tension: 170, friction: 26 } });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income Card */}
      <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl rounded-2xl border border-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
            Income
          </CardTitle>
          <ArrowUpCircle className="w-8 h-8 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 drop-shadow-lg">
            ₹ <animated.span>{incomeSpring.val.to(val => val.toFixed(2))}</animated.span>
          </p>
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl rounded-2xl border border-gradient-to-r from-red-400 via-rose-400 to-pink-400">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
            Expense
          </CardTitle>
          <ArrowDownCircle className="w-8 h-8 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-600 drop-shadow-lg">
            ₹ <animated.span>{expenseSpring.val.to(val => val.toFixed(2))}</animated.span>
          </p>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl rounded-2xl border border-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Balance
          </CardTitle>
          <Wallet className="w-8 h-8 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 drop-shadow-lg">
            ₹ <animated.span>{balanceSpring.val.to(val => val.toFixed(2))}</animated.span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
