'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const FirebaseAuthComponent = dynamic(() => import('./FirebaseAuthComponent'), { ssr: false });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [success, setSuccess] = useState(false);

  const handleSignInSuccess = () => {
    if (typeof window !== 'undefined') {
      router.push("/app/Dashboard");
    }
  };

  useEffect(() => {
    const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
      if (success) {
        console.log("Success login!!!");
      }
    };
    setIsLoading(false);
  }, [success]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Sign In</h2>
      <FirebaseAuthComponent email={email} password={password} setEmail={setEmail} setPassword={setPassword} onSuccess={handleSignInSuccess} />
    </div>
  );
}