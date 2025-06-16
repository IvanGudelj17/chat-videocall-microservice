'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

interface RoomsLayoutProps {
  children: ReactNode;
}

export default function RoomsLayout({ children }: RoomsLayoutProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const username = window.localStorage.getItem('username');
    if (!username) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return null; // or a spinner if you want
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
