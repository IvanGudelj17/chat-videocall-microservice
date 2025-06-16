// File: hooks/useRoomInfo.ts
// Hook koji dohvaća naziv sobe sa servera preko roomId parametra

import { useEffect, useState } from 'react';

export function useRoomInfo(roomId: string) {
  const [roomName, setRoomName] = useState('');

  // 🌐 Dohvat soba i postavi naziv aktivne sobe
  useEffect(() => {
    fetch(`http://localhost:8080/websocket/getRooms`)
      .then((r) => r.json())
      .then((list: { id: string; name: string }[]) => {
        const room = list.find((r) => r.id === roomId);
        if (room) setRoomName(room.name);
      })
      .catch(console.error);
  }, [roomId]);

  return roomName;
}
