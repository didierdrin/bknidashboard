'use client';
import React from 'react';
import { auth } from '../../../firebaseApp';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface FirebaseAuthComponentProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}

export default function FirebaseAuthComponent({ email, password, setEmail, setPassword }: FirebaseAuthComponentProps) {
  const router = useRouter();

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/app/Dashboard");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={signIn}>
      <input 
        type="text" 
        value={email} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button type="submit">Sign In</button>
    </form>
  );
}