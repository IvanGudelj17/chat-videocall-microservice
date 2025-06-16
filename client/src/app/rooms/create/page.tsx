// Ova stranica omogućuje korisniku da kreira novu sobu.
// Korisnik unosi ime sobe, a sustav automatski generira ID sobe (UUID).
// Podaci se šalju backendu putem POST zahtjeva na /websocket/createRoom.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Room } from '@/types/types';

export default function CreateRoomPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Funkcija za slanje zahtjeva za kreiranje sobe
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const roomId = crypto.randomUUID(); // generiramo jedinstveni ID sobe
    const room: Room = { id: roomId, name };

    try {
      const res = await fetch('http://localhost:8080/websocket/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(room),
      });

      if (!res.ok) throw new Error('Greška pri kreiranju sobe');
      setMessage('Soba uspješno kreirana!');
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleCreateRoom}
        className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-blue-700 text-center">Kreiraj novu sobu</h1>

        {/* Unos imena sobe */}
        <input
          type="text"
          placeholder="Naziv sobe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded colors-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          required
        />

        {/* Gumb za kreiranje sobe */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Kreiraj sobu
        </button>

        {/* Prikaz statusne poruke */}
        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </form>
    </main>
  );
}
