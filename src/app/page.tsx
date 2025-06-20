"use client"

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8 overflow-hidden">
      {/* Background blobs/shapes for a modern feel */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>

      {/* Main content card - mimicking the clean, rounded look of the dashboard cards */}
      <main className="relative z-10 bg-white p-10 md:p-12 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Expense Tracker
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Gain clarity on your finances. Track, categorize, and visualize your spending effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link href="/auth/login" passHref>
            <button className="flex-1 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-35">
              Login
            </button>
          </Link>
          <Link href="/auth/signup" passHref>
            <button className="flex-1 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-35">
              Sign Up
            </button>
          </Link>
        </div>
      </main>

      {/* Tailwind CSS keyframes for the blob animation (add to your global CSS or styles file) */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.2, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
