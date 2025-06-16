// File: components/ChatSection.tsx
// Prikazuje chat poruke, unos teksta i listu korisnika u sobi.

import React from 'react';
import { Message } from '@/types/types';

interface Client {
  id: string;
  username: string;
}

interface Props {
  roomName: string;
  clients: Client[];
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  socketRef: React.MutableRefObject<WebSocket | null>;
  username: string;
  roomId: string;
}

export default function ChatSection({
  roomName,
  clients,
  messages,
  input,
  setInput,
  socketRef,
  username,
  roomId,
}: Props) {
  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({ type: 'chat', content: input, username, roomId })
    );
    setInput('');
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-700">Soba: {roomName}</h2>
        <span className="text-sm text-gray-600">Korisnici: {clients.length}</span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Lista korisnika */}
        <aside className="w-full md:w-1/3 p-4 border-r">
          <h3 className="font-semibold mb-2">U sobi:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            {clients.map((c) => (
              <li key={c.id}>
                {c.username} {c.username === username && '(ti)'}
              </li>
            ))}
          </ul>
        </aside>

        {/* Poruke i unos */}
        <section className="w-full md:w-2/3 p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-blue-600">{m.username}:</span>{' '}
                <span className="text-gray-900">{m.content}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Upiši poruku..."
              className="flex-1 border p-2 rounded-lg"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Pošalji
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
