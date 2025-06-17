import TransactionsPageClient from './TransactionsClient';
import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsPageClient />
    </Suspense>
  );
}
