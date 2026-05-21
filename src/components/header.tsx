
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { LogOut, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';


export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <header className="bg-card py-4 shadow-md relative">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Link href="/">
          <span className="font-headline text-4xl font-bold text-primary cursor-pointer">ROJReviews</span>
        </Link>
      </div>
      {user && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="h-5 w-5" />
                <span className="hidden md:inline">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      )}
    </header>
  );
}
