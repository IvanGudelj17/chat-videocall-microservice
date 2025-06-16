// File: hooks/useIdentity.ts
// Hook koji dohvaća korisnički ID i korisničko ime iz local/session storagea

import { useEffect, useState } from 'react';

export function useIdentity() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  // 📦 Dohvati podatke iz sessionStorage i localStorage
  useEffect(() => {
    let id = sessionStorage.getItem('userID');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('userID', id);
    }
    setEmail(id);
    setUsername(localStorage.getItem('username') ?? 'Anonimac');
  }, []);

  return { email, username };
}
