// Ova stranica prikazuje formu za registraciju korisnika.
// Korisnik unosi korisničko ime i lozinku, a podaci se šalju backendu putem POST zahtjeva na /signup.
// Nakon uspješne registracije, prikazuje se poruka. U suprotnom, prikazuje se greška.

'use client';

import { useState } from 'react';
import { post } from '@/lib/api';
import { CreateUserReq } from '@/types/types';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body: CreateUserReq = { username, password, email };// svi su obvezni podaci 
      await post('/signup', body);
      setMessage('Registracija uspješna!');
      localStorage.setItem('username', username);
      router.push('/login'); // preusmjeri na login
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-blue-700">Registracija</h1>
        <input
          placeholder="Korisničko ime"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Registriraj se
        </button>

        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </form>
    </main>
  );
}
