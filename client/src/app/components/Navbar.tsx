'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem('username') ?? '';
    setUsername(stored);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('username');
    router.replace('/login');
  };

  return (
    <nav className="bg-gray-300 border-b shadow px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-blue-700">Nazad
        </button>
        <span className="text-lg font-bold text-blue-700">ChatApp</span>
      </div>
      <div className="flex items-center space-x-4">
        {username && (
          <span className="text-sm text-gray-700">
            👤 <span className="font-semibold">{username}</span>
          </span>
        )}
        <Link
          href="/rooms/create"
          className="text-sm text-blue-500 hover:underline"
        >
          Home
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:underline"
        >
          Odjava
        </button>
      </div>
    </nav>
  );
}
