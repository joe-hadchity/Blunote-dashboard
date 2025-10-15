"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 Callback page - Full URL:', window.location.href);
        console.log('🔍 Callback page - Hash:', window.location.hash);
        
        // Get tokens from URL hash (Supabase sends them as #access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const provider_token = hashParams.get('provider_token');

        console.log('🔍 Tokens found:', {
          has_access_token: !!access_token,
          has_refresh_token: !!refresh_token,
          type,
          has_provider_token: !!provider_token
        });

        // Clean up the URL immediately (remove hash)
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (!access_token || !refresh_token) {
          console.error('❌ Missing tokens');
          setStatus('error');
          setMessage('Invalid authentication link. Please try again.');
          return;
        }

        // Check if this is a Google OAuth callback (has provider_token)
        if (provider_token) {
          console.log('✅ Google OAuth detected');
          setMessage('Signing in with Google...');
          
          // For Google OAuth, call the verify-email endpoint which sets cookies
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
              access_token, 
              refresh_token,
              type: 'oauth'
            }),
          });

          const data = await response.json();
          console.log('📡 OAuth response:', { ok: response.ok, data });

          if (response.ok) {
            setStatus('success');
            setMessage('Successfully signed in! Redirecting...');
            
            // Redirect to recordings page
            console.log('🎯 Redirecting to /recordings');
            setTimeout(() => {
              window.location.href = '/recordings';
            }, 500);
          } else {
            console.error('❌ OAuth failed:', data);
            setStatus('error');
            setMessage(data.error || 'Sign in failed. Please try again.');
          }
        } else {
          console.log('📧 Email verification detected');
          // Email verification flow
          setMessage('Verifying your email...');
          
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
              access_token, 
              refresh_token,
              type: type || 'signup'
            }),
          });

          const data = await response.json();
          console.log('📡 Email verification response:', { ok: response.ok, data });

          if (response.ok) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');
            
            // Redirect to recordings page
            console.log('🎯 Redirecting to /recordings');
            setTimeout(() => {
              window.location.href = '/recordings';
            }, 500);
          } else {
            console.error('❌ Verification failed:', data);
            setStatus('error');
            setMessage(data.error || 'Verification failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-boxdark-2 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-10 w-10 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Processing...
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Success
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Authentication Failed
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
              <div className="flex flex-col space-y-3 pt-2">
                <Link
                  href="/signin"
                  className="inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition"
                >
                  Go to Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-boxdark-2 transition"
                >
                  Sign Up Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

