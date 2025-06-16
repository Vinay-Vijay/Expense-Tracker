'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleThemeChange = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/auth/login'); // redirect to login page after logout
    } else {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-background shadow-md border-b">
      <div className="text-lg font-bold text-primary">ExpenseTracker</div>

      <nav className="flex space-x-6">
        <Link href="/dashboard">
          <span className="text-muted-foreground hover:text-primary cursor-pointer">Dashboard</span>
        </Link>
        <Link href="/transactions">
          <span className="text-muted-foreground hover:text-primary cursor-pointer">Transactions</span>
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
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
