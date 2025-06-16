'use client';

/**
 * LoginPage prikazuje jednostavnu formu za prijavu korisnika.
 * Na submit poziva POST /login API, sprema podatke u localStorage i preusmjerava korisnika na /rooms.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';
import { LoginUserReq, LoginUserRes } from '@/types/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email (state):", email);
    console.log("Password (state):", password);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log("Email koji se šalje:", trimmedEmail);
    console.log("Lozinka koja se šalje:", trimmedPassword);

    try {
      const body: LoginUserReq = {
        email: trimmedEmail,
        password: trimmedPassword,
      };

      console.log('Šaljem podatke za prijavu:', body);
      const response = await post<LoginUserRes>('/login', body);
      localStorage.setItem('username', response.username);
      localStorage.setItem('email', response.email);
      router.push('/rooms');
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-blue-700">Prijava</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Prijavi se
        </button>

        {message && (
          <p className="text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </main>
  );
}
