'use client';

import ExpenseChart from '../../components/CategoryAndHistoryCards';
import Header from '../../components/Header';
import AddBar from '../../components/AddBar';
import CategoryCharts from '@/components/CategoryCharts';
import OverviewCards from '@/components/OverviewCards';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Header user={null} />
      <div className="p-6 space-y-6">
        <AddBar />
        <CategoryCharts />
        <OverviewCards />
        <ExpenseChart />
      </div>
    </div>
  );
}
