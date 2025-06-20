'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { setTheme } = useTheme();

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('theme');
    setTheme('light');
  }, [setTheme]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any previous errors before attempting login
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Set the loginError state with the error message
      setLoginError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
        {/* Display loginError if it exists */}
        {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Password field with show/hide toggle */}
        <div className="relative">
          <input
            className="border p-2 rounded pr-10 w-full"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          className="flex-1 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="submit">
          Login
        </button>
        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </main>
  );
}