'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ExpenseChart from '../../components/ExpenseChart';
import Header from '../../components/Header';
import GreetingBar from '../../components/AddBar';
import CategoryCharts from '@/components/CategoryCharts';
import OverviewCards from '@/components/OverviewCards';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email || 'User';
        setUserName(name);
      } else {
        setUserName('Guest');
      }
    };

    fetchUser();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <Header user={null} />
      <div className="p-6 space-y-6">
        <GreetingBar user={userName ?? 'Loading...'} />
        <OverviewCards />
        <CategoryCharts />
        <ExpenseChart />
      </div>
    </div>
  );
}
