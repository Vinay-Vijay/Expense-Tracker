'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Wallet, Moon, Sun, PiggyBank, User } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Sidebar({ }: { user: string | null }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/auth/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-20 flex flex-col justify-between 
      bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl border-r 
      border-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 z-30">

      <div className="flex flex-col items-center mt-4 space-y-6">
        {/* App Logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard" className="p-2 pb-0 rounded-lg">
              <PiggyBank className="w-6 h-6 text-blue-600 dark:text-indigo-400" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Expense Tracker</TooltipContent>
        </Tooltip>

        {/* Navigation Icons Group */}
        <div className="flex flex-col items-center space-y-6">
          {/* Dashboard Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard">
                <Home className={`w-6 h-6 cursor-pointer ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Move to Dashboard</TooltipContent>
          </Tooltip>

          {/* Transactions Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/transactions">
                <Wallet className={`w-6 h-6 cursor-pointer ${isActive('/transactions') ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">View all Transactions</TooltipContent>
          </Tooltip>
        </div>

      </div>


      {/* Bottom: Theme Toggle + Avatar with Logout */}
      <div className="flex flex-col items-center mb-4 space-y-6">
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 cursor-pointer text-yellow-400" onClick={() => setTheme('light')} />
        ) : (
          <Moon className="w-6 h-6 cursor-pointer text-blue-600" onClick={() => setTheme('dark')} />
        )}

        {/* Avatar Dropdown with Default Human Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
