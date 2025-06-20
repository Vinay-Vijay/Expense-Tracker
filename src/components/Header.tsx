'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Header({ user }: { user: string | null }) {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleThemeChange = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/auth/login');
    } else {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 
      bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl border-b 
      border-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
      
      <Link href="/dashboard" className="text-lg font-extrabold text-transparent bg-clip-text 
        bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer">
        ExpenseTracker
      </Link>

      <nav className="flex space-x-6">
        <Link href="/dashboard">
          <span className={`cursor-pointer transition-colors duration-300 ${
            isActive('/dashboard') 
              ? 'text-blue-600 dark:text-indigo-400 font-semibold' 
              : 'text-muted-foreground hover:text-primary'
          }`}>
            Dashboard
          </span>
        </Link>
        <Link href="/transactions">
          <span className={`cursor-pointer transition-colors duration-300 ${
            isActive('/transactions') 
              ? 'text-blue-600 dark:text-indigo-400 font-semibold' 
              : 'text-muted-foreground hover:text-primary'
          }`}>
            Transactions
          </span>
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Light</span>
          <Switch checked={isDark} onCheckedChange={handleThemeChange} />
          <span className="text-sm">Dark</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarFallback>{user?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
