'use client';

import ChatRoom from '@/app/components/ChatRoom';
import { useParams } from 'next/navigation';


export default function Page() {
  const params = useParams();
  const raw = params.roomId;
  const roomId = Array.isArray(raw) ? raw[0] : raw;
  if (!roomId) return null; // guard prije nego što išta client-side renderiramo

  return <ChatRoom roomId={roomId} />;
}
