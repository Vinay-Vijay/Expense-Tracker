import TransactionsPageClient from './TransactionsClient';
import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 ml-20 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionsPageClient />
      </Suspense>
    </div>
  );
}
