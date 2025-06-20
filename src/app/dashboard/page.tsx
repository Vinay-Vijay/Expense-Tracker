'use client';

import Sidebar from '../../components/SideBar';
import AddBar from '../../components/AddBar';
import OverviewCards from '@/components/OverviewCards';
import CategoryCharts from '@/components/CategoryCharts';
import CategoryAndHistoryCards from '@/components/CategoryAndHistoryCards';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar user={null} />

      {/* Main Content */}
      <div className="flex-1 ml-20 flex justify-center overflow-x-hidden">
        <main className="w-full max-w-7xl p-6 space-y-6 overflow-x-hidden">
          <AddBar />
          <OverviewCards />
          <CategoryCharts />
          <CategoryAndHistoryCards />
        </main>
      </div>
    </div>
  );
}
