import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ExpenseList from '../../components/ExpenseList';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseChart from '../../components/ExpenseChart';

export default function DashboardPage() {
  const supabase = createClientComponentClient();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <ExpenseForm />
      <ExpenseList />
      <ExpenseChart />
    </div>
  );
}
