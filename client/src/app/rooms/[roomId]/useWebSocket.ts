// client/src/app/rooms/[roomId]/useWebSocket.ts

import { useEffect, useRef, useCallback } from 'react';
import { WSMessage } from '@/types/types';

export function useWebSocket(
  roomId: string,
  onMessage: (msg: WSMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const userID = window.localStorage.getItem('userID');
    const username = window.localStorage.getItem('username');
    const ws = new WebSocket(
      `ws://localhost:8080/ws/join/${roomId}?userID=${userID}&username=${username}`
    );
    wsRef.current = ws;

    const listener = (e: MessageEvent) => {
      const msg = JSON.parse(e.data) as WSMessage;
      onMessage(msg);
    };
    ws.addEventListener('message', listener);
    return () => {
      ws.removeEventListener('message', listener);
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, onMessage]);

  const send = useCallback((msg: WSMessage) => {
    wsRef.current?.send(JSON.stringify(msg));
  }, []);

  return { send };
}
