import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to Expense Tracker</h1>
      <p className="text-lg mb-6">Track your expenses and visualize your spending habits easily.</p>
      <div className="flex space-x-4">
        <Link href="/auth/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Login</button>
        </Link>
        <Link href="/auth/signup">
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Sign Up</button>
        </Link>
      </div>
    </main>
  );
}
