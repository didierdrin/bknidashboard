'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseApp';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import dynamic from 'next/dynamic';

const ClientSideRouterHandler = dynamic(() => import('./ClientSideRouterHandler'), { ssr: false });

function isTouchOrSmallScreen() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  return mobileUa || coarsePointer || narrow;
}

function authErrorMessage(code: string, isSignUp: boolean) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Wrong password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Retrying with redirect…';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return isSignUp ? 'Sign up failed. Please try again.' : 'Sign in failed. Please try again.';
  }
}

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirectChecking, setRedirectChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getRedirectResult(auth)
      .catch((error: { code?: string; customData?: { email?: string } }) => {
        if (cancelled) return;
        if (error.code === 'auth/account-exists-with-different-credential') {
          setAuthError(
            'An account already exists with this email. Sign in with your password, then link Google.'
          );
        } else if (error.code && error.code !== 'auth/popup-closed-by-user') {
          setAuthError(authErrorMessage(error.code, false));
        }
      })
      .finally(() => {
        if (!cancelled) setRedirectChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      setAuthError(authErrorMessage(code, isSignUp));
      console.error('Error signing in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (isTouchOrSmallScreen()) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        await signInWithPopup(auth, provider);
      } catch (popupError: unknown) {
        const code = (popupError as { code?: string })?.code ?? '';
        if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }
    } catch (error: unknown) {
      const err = error as { code?: string; customData?: { email?: string } };
      if (err.code === 'auth/account-exists-with-different-credential') {
        const conflictEmail = err.customData?.email;
        if (conflictEmail) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, conflictEmail);
            if (methods[0] === 'password') {
              setAuthError(
                'An account already exists with this email. Sign in with your password, then link Google.'
              );
            } else {
              setAuthError('An account already exists with a different sign-in method.');
            }
          } catch {
            setAuthError('An account already exists with this email. Try signing in another way.');
          }
        } else {
          setAuthError('An account already exists with a different sign-in method.');
        }
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('');
      } else {
        setAuthError(authErrorMessage(err.code ?? '', false));
        console.error('Error signing in:', error);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading || redirectChecking) {
    return (
      <div className="auth-shell flex min-h-screen items-center justify-center">
        <div className="auth-loader" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (user) {
    return <ClientSideRouterHandler />;
  }

  return (
    <div className="auth-shell relative min-h-screen overflow-hidden">
      <div className="auth-ambient" aria-hidden />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-2">
        {/* Brand panel — desktop */}
        <aside className="auth-brand-panel relative hidden flex-col justify-between p-10 text-white lg:flex xl:p-14">
          <div className="auth-brand-art" aria-hidden />
          <div className="relative z-10">
            <p className="auth-brand-mark">Bukon!</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              Seller dashboard for Rwanda&apos;s all-in-one shop.
            </p>
          </div>
          <div className="relative z-10 max-w-md">
            <h1 className="auth-display text-4xl leading-tight xl:text-5xl">
              Run inventory, orders, and storefront from one place.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              Sign in to manage your catalog and keep every sale moving.
            </p>
          </div>
          <p className="relative z-10 text-xs tracking-wide text-white/45">
            Made in Rwanda
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md auth-form-enter">
            <div className="mb-8 lg:hidden">
              <p className="auth-brand-mark text-[var(--auth-ink)]">Bukon!</p>
              <p className="mt-2 text-sm text-[var(--auth-muted)]">
                Seller dashboard — made in Rwanda
              </p>
            </div>

            <h2 className="auth-display text-3xl text-[var(--auth-ink)] sm:text-4xl">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-[var(--auth-muted)]">
              {isSignUp
                ? 'Set up your seller account to get started.'
                : 'Sign in to continue to your dashboard.'}
            </p>

            <form onSubmit={handleEmailSignIn} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--auth-ink)]" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@business.com"
                  className="auth-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting || googleLoading}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--auth-ink)]" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                  className="auth-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignUp ? 6 : undefined}
                  disabled={submitting || googleLoading}
                />
              </div>

              {authError ? (
                <div className="auth-error" role="alert">
                  {authError}
                </div>
              ) : null}

              <button
                className="auth-btn-primary"
                type="submit"
                disabled={submitting || googleLoading}
              >
                {submitting ? (isSignUp ? 'Creating account…' : 'Signing in…') : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider my-6">
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="auth-btn-google"
              disabled={submitting || googleLoading}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            <p className="mt-8 text-center text-sm text-[var(--auth-muted)]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="font-semibold text-[var(--auth-accent)] underline-offset-2 hover:underline"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
                disabled={submitting || googleLoading}
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
