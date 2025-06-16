// File: hooks/useWebSocket.ts
// Hook koji upravlja WebSocket konekcijom, porukama i sinkronizacijom WebRTC logike.

import { useEffect, useCallback } from 'react';
import Peer from 'simple-peer';
import { WSMessage, WSChatMessage, WSNotificationMessage } from '@/types/types';

interface Client {
  id: string;
  username: string;
}

interface UseWebSocketProps {
  roomId: string;
  email: string;
  username: string;
  setClients: (value: Client[]) => void;
  setMessages: (value: (prev: (WSChatMessage | WSNotificationMessage)[]) => (WSChatMessage | WSNotificationMessage)[]) => void;
  setIsInitiator: (value: boolean) => void;
  setPeerReady: (value: boolean) => void;
  setCallAccepted: (value: boolean) => void;
  setCallIncoming: (value: boolean) => void;
  setHasInitiatedCall: (value: boolean) => void;
  peerRef: React.MutableRefObject<Peer.Instance | null>;
  socketRef: React.MutableRefObject<WebSocket | null>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useWebSocket({
  roomId,
  email,
  username,
  setClients,
  setMessages,
  setIsInitiator,
  setPeerReady,
  setCallAccepted,
  setCallIncoming,
  setHasInitiatedCall,
  peerRef,
  socketRef,
  localVideoRef,
  remoteVideoRef,
}: UseWebSocketProps) {
  const endCall = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;

    if (localVideoRef.current?.srcObject instanceof MediaStream) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject instanceof MediaStream) {
      remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setCallAccepted(false);
    setHasInitiatedCall(false);
    setPeerReady(false);

    socketRef.current?.send(
      JSON.stringify({ type: 'call-end', username, roomId })
    );
  }, [localVideoRef, peerRef, remoteVideoRef, roomId, setCallAccepted, setHasInitiatedCall, setPeerReady, socketRef, username]);

  useEffect(() => {
    if (!email || !username) return;
    const ws = new WebSocket(
      `ws://localhost:8080/websocket/joinRoom/${roomId}?userID=${email}&username=${username}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      fetch(`http://localhost:8080/websocket/getClients/${roomId}`)
        .then((r) => r.json())
        .then((list: Client[]) => {
          setClients(list);
          setIsInitiator(list.length === 1);
        })
        .catch(console.error);
    };

    ws.onmessage = (ev: MessageEvent<string>) => {
      const msg: WSMessage = JSON.parse(ev.data);
      switch (msg.type) {
        case 'signal':
          if (msg.from !== email) {
            peerRef.current?.signal(msg.data);
          }
          break;
        case 'chat':
        case 'notification':
          setMessages((prev) => [...prev, msg]);
          break;
        case 'call-request':
          if (msg.username !== username) {
            setCallIncoming(true);
          }
          break;
        case 'call-accept':
          if (msg.username !== username) {
            setCallAccepted(true);
            setPeerReady(true);
          }
          break;
        case 'call-end':
          if (msg.username !== username) {
            endCall();
          }
          break;
      }
    };

    return () => ws.close();
  }, [roomId, email, username, endCall, socketRef, setClients, setIsInitiator, setMessages, peerRef, setCallIncoming, setCallAccepted, setPeerReady]);

  const handleCallRequest = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'call-request',
        username,
        roomId,
        content: `${username} zove na video poziv`,
      })
    );
    setHasInitiatedCall(true);
  }, [roomId, setHasInitiatedCall, socketRef, username]);

  const handleAcceptCall = useCallback(() => {
    setCallAccepted(true);
    setPeerReady(true);
    socketRef.current?.send(
      JSON.stringify({ type: 'call-accept', username, roomId })
    );
    setCallIncoming(false);
  }, [setCallAccepted, setPeerReady, socketRef, username, roomId, setCallIncoming]);

  return { handleCallRequest, handleAcceptCall, endCall };
}
