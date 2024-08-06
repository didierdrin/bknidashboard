'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation instead of next/router
import dynamic from 'next/dynamic';

const FirebaseAuthComponent = dynamic(() => import('./FirebaseAuthComponent'), { ssr: false });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSignInSuccess = () => {
    const router = useRouter();
    router.push("/app/Dashboard");
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Your sign-in logic here
      setSuccess(true); // Set success only after successful sign-in
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

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