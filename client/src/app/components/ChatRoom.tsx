// File: components/ChatRoom.tsx
// Glavna komponenta sobe za razgovor i video poziv.
// Koristi vlastite hookove za WebSocket, WebRTC, identitet i dohvat sobe.

'use client';

import { useRef, useState } from 'react';
import Peer from 'simple-peer';
import VideoSection from './VideoSection';
import ChatSection from './ChatSection';


import { WSChatMessage, WSNotificationMessage } from '@/types/types';
import { useIdentity } from '../hooks/useIdentity';
import { useRoomInfo } from '../hooks/useRoominfo';
import { useWebSocket } from '../hooks/useWebSocket';
import { useWebRTC } from '../hooks/useWebRtc';

interface Client {
  id: string;
  username: string;
}

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const { email, username } = useIdentity();
  const roomName = useRoomInfo(roomId);

  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<(WSChatMessage | WSNotificationMessage)[]>([]);
  const [input, setInput] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [callIncoming, setCallIncoming] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [hasInitiatedCall, setHasInitiatedCall] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // WebSocket: setup poruka i komunikacija
  const wsHandlers = useWebSocket({
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
  });

  const { handleCallRequest, handleAcceptCall, endCall } = wsHandlers;

  // WebRTC: streamovi i ICE konekcija
  useWebRTC({
    peerReady,
    isInitiator,
    roomId,
    email,
    socketRef,
    peerRef,
    localVideoRef,
    remoteVideoRef,
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {callIncoming && !callAccepted && (
        <div className="fixed top-0 w-full bg-yellow-200 text-black p-4 text-center z-50 border-b border-yellow-500 shadow-md">
          Poziv u tijeku...
          <button
            onClick={handleAcceptCall}
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          >
            Prihvati
          </button>
        </div>
      )}

      {!callAccepted && !hasInitiatedCall && (
        <button
          onClick={handleCallRequest}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Pokreni video poziv
        </button>
      )}

      {callAccepted && (
        <VideoSection
          username={username}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onEndCall={endCall}
        />
      )}
      <ChatSection
        roomName={roomName}
        clients={clients}
        messages={messages}
        input={input}
        setInput={setInput}
        socketRef={socketRef}
        username={username}
        roomId={roomId}
      />
    </main>
  );
}
