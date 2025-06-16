// File: components/VideoSection.tsx
// Prikazuje lokalni i udaljeni video stream, uključuje gumb za prekid poziva.

import React, { RefObject } from 'react';

interface Props {
  username: string;
  localVideoRef: RefObject<HTMLVideoElement | null>; 
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  onEndCall: () => void;
}


export default function VideoSection({
  username,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
}: Props) {
  return (
    <div className="w-full max-w-4xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4 bg-white shadow">
      {/* Lokalni video */}
      <div className="relative">
        <video
          ref={localVideoRef}
          playsInline
          autoPlay
          muted
          className="w-full h-60 object-cover rounded-lg shadow bg-black border border-gray-400"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded">
          {username} (ti)
        </div>
      </div>

      {/* Udaljeni video */}
      <div className="relative">
        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          className="w-full h-60 object-cover rounded-lg shadow bg-black border border-gray-400"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded">
          Drugi korisnik
        </div>
        <button
          onClick={onEndCall}
          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow"
        >
          Završi poziv
        </button>
      </div>
    </div>
  );
}
