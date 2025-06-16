// Početna stranica aplikacije.
// Prikazuje dobrodošlicu i navigacijske gumbe za prijavu i registraciju.
// Koristi Tailwind CSS za izgled.

'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md text-center space-y-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700">Dobrodošli u Chat Aplikaciju</h1>
        <p className="text-gray-600">
          Prijavite se ili registrirajte kako biste započeli razgovore u sobama.
        </p>

        {/* Gumbi za navigaciju */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Prijava
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Registracija
          </button>
        </div>
      </div>
    </main>
  );
}
