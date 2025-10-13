"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CheckAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setChecking(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    try {
      // Check 1: Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.checks.push({
        name: 'Session Check',
        status: session ? 'PASS' : 'FAIL',
        data: {
          hasSession: !!session,
          expiresAt: session?.expires_at,
          error: sessionError?.message
        }
      });

      // Check 2: Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      results.checks.push({
        name: 'User Check',
        status: user ? 'PASS' : 'FAIL',
        data: {
          userId: user?.id,
          email: user?.email,
          error: userError?.message
        }
      });

      // Check 3: Try API call
      try {
        const apiResponse = await fetch('/api/recordings?page=1&limit=1', {
          credentials: 'include'
        });
        
        results.checks.push({
          name: 'API Call',
          status: apiResponse.ok ? 'PASS' : 'FAIL',
          data: {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            response: apiResponse.ok ? await apiResponse.json() : await apiResponse.text()
          }
        });
      } catch (apiErr: any) {
        results.checks.push({
          name: 'API Call',
          status: 'FAIL',
          data: { error: apiErr.message }
        });
      }

      // Check 4: Cookies
      const allCookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);
      const hasAuthCookie = allCookies.some(c => c.includes('sb-') || c.includes('supabase'));
      
      results.checks.push({
        name: 'Cookies',
        status: hasAuthCookie ? 'PASS' : 'FAIL',
        data: {
          hasSbCookie: hasAuthCookie,
          allCookies: allCookies
        }
      });

      results.overall = results.checks.every((c: any) => c.status === 'PASS') ? 'PASS' : 'FAIL';

    } catch (err: any) {
      results.error = err.message;
      results.overall = 'ERROR';
    }

    setAuthStatus(results);
    setChecking(false);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        🔍 Authentication Status
      </h1>

      <button
        onClick={checkAuth}
        className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        🔄 Recheck
      </button>

      {checking ? (
        <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">Checking...</p>
        </div>
      ) : authStatus ? (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`rounded-lg p-6 ${
            authStatus.overall === 'PASS' 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <h2 className="text-xl font-bold mb-2">
              {authStatus.overall === 'PASS' ? '✅ All Checks Passed' : '❌ Issues Found'}
            </h2>
            <p className="text-sm">
              {authStatus.overall === 'PASS' 
                ? 'Your authentication is working correctly.' 
                : 'Please fix the issues below.'}
            </p>
          </div>

          {/* Individual Checks */}
          {authStatus.checks.map((check: any, idx: number) => (
            <div
              key={idx}
              className={`rounded-lg p-6 ${
                check.status === 'PASS' 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {check.status === 'PASS' ? '✅' : '❌'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {check.name}
                </h3>
              </div>
              <pre className="overflow-auto rounded bg-gray-800 p-3 text-xs text-white">
                {JSON.stringify(check.data, null, 2)}
              </pre>
            </div>
          ))}

          {/* Quick Fixes */}
          {authStatus.overall !== 'PASS' && (
            <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6 dark:bg-yellow-900/20">
              <h3 className="mb-3 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                🔧 Quick Fixes
              </h3>
              <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                <div>
                  <strong>1. Clear cache and log in again:</strong>
                  <div className="mt-2 flex gap-2">
                    <a
                      href="/signout"
                      className="rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                    >
                      Sign Out
                    </a>
                    <a
                      href="/signin"
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                    >
                      Sign In
                    </a>
                  </div>
                </div>
                <div>
                  <strong>2. Clear browser cookies:</strong>
                  <p className="ml-5">Press F12 → Application → Cookies → Clear all</p>
                </div>
                <div>
                  <strong>3. Try incognito mode:</strong>
                  <p className="ml-5">Open in private/incognito window and log in fresh</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}



