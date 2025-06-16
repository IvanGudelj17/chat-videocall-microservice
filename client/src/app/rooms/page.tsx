// Ova stranica prikazuje popis svih dostupnih soba dohvaćenih s backend servera.
// Korisnik može klikom na gumb ući u određenu sobu ili kreirati novu sobu.

'use client';

import { useEffect, useState } from 'react';
import { Room } from '@/types/types';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // Dohvat soba s backend servera
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('http://localhost:8080/websocket/getRooms', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Greška pri dohvaćanju soba');
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchRooms();
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white p-8 rounded shadow space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Dostupne sobe</h1>
          <button
            onClick={() => router.push('/rooms/create')}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Nova soba
          </button>
        </div>

        {/* Poruka o grešci ako postoji */}
        {error && (
          <p className="text-red-600 text-center bg-red-100 p-2 rounded">{error}</p>
        )}

        {/* Ako nema soba */}
        {rooms.length === 0 && !error && (
          <p className="text-gray-500 text-center">Trenutno nema dostupnih soba.</p>
        )}

        {/* Popis soba */}
        <ul className="space-y-4">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-semibold">{room.name}</p>
                <p className="text-sm text-gray-500">ID: {room.id}</p>
              </div>
              <button
                onClick={() => router.push(`/rooms/${room.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Uđi
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
