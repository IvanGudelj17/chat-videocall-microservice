// File: hooks/useWebRTC.ts
// Hook koji se bavi uspostavom WebRTC konekcije i upravlja lokalnim/udaljenim streamovima

import { useEffect } from 'react';
import Peer, { Instance as PeerInstance, SignalData } from 'simple-peer';
import { WSSignalMessage } from '@/types/types';

interface UseWebRTCProps {
  peerReady: boolean;
  isInitiator: boolean;
  roomId: string;
  email: string;
  socketRef: React.MutableRefObject<WebSocket | null>;
  peerRef: React.MutableRefObject<PeerInstance | null>;
  localVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

export function useWebRTC({
  peerReady,
  isInitiator,
  roomId,
  email,
  socketRef,
  peerRef,
  localVideoRef,
  remoteVideoRef
}: UseWebRTCProps) {
  // 🎥 Pokreće WebRTC konekciju i spaja streamove
  useEffect(() => {
    if (!peerReady || peerRef.current) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.play();
        }

        const peer = new Peer({
          initiator: isInitiator,
          trickle: false,
          stream,
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data: SignalData) => {
          const msg: WSSignalMessage = {
            type: 'signal',
            roomId,
            data,
            from: email,
          };
          socketRef.current?.send(JSON.stringify(msg));
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });

        peerRef.current = peer;
      })
      .catch(console.error);
  }, [peerReady, isInitiator, roomId, email, socketRef, peerRef, localVideoRef, remoteVideoRef]);
}
