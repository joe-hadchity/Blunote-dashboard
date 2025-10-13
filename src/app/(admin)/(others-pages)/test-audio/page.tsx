"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestAudioPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  async function runDiagnostics() {
    setTesting(true);
    const results = [];

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        results.push({ test: 'Authentication', status: 'fail', message: 'Not logged in' });
        setTestResults(results);
        setTesting(false);
        return;
      }
      results.push({ test: 'Authentication', status: 'pass', message: `Logged in as ${user.email}` });

      // 1. Check recordings in database
      const { data: recordings, error: dbError } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (dbError) {
        results.push({ test: 'Database Query', status: 'fail', message: dbError.message });
      } else {
        results.push({ 
          test: 'Database Query', 
          status: 'pass', 
          message: `Found ${recordings?.length || 0} recordings`,
          data: recordings
        });
      }

      // 2. Check storage files
      const { data: files, error: storageError } = await supabase.storage
        .from('meeting-audios')
        .list(user.id, { limit: 5, sortBy: { column: 'created_at', order: 'desc' } });

      if (storageError) {
        results.push({ test: 'Storage Access', status: 'fail', message: storageError.message });
      } else {
        results.push({ 
          test: 'Storage Access', 
          status: 'pass', 
          message: `Found ${files?.length || 0} files`,
          data: files
        });
      }

      // 3. Test audio URL accessibility
      if (recordings && recordings.length > 0) {
        for (const recording of recordings.slice(0, 3)) {
          const audioUrl = recording.audio_url || recording.recording_url;
          
          if (!audioUrl) {
            results.push({ 
              test: `Recording ${recording.id.slice(0, 8)}`, 
              status: 'fail', 
              message: 'No audio URL' 
            });
            continue;
          }

          // Test if URL is accessible
          try {
            const response = await fetch(audioUrl, { method: 'HEAD' });
            const size = response.headers.get('content-length');
            const contentType = response.headers.get('content-type');
            
            if (response.ok) {
              results.push({
                test: `File ${recording.id.slice(0, 8)}`,
                status: 'pass',
                message: `Accessible (${size} bytes, ${contentType})`,
                url: audioUrl,
                size: parseInt(size || '0'),
                contentType
              });
            } else {
              results.push({
                test: `File ${recording.id.slice(0, 8)}`,
                status: 'fail',
                message: `HTTP ${response.status}`,
                url: audioUrl
              });
            }
          } catch (err: any) {
            results.push({
              test: `File ${recording.id.slice(0, 8)}`,
              status: 'fail',
              message: err.message,
              url: audioUrl
            });
          }
        }
      }

      // 4. Check bucket configuration
      const { data: buckets } = await supabase.storage.listBuckets();
      const audioBucket = buckets?.find(b => b.name === 'meeting-audios');
      
      if (audioBucket) {
        results.push({
          test: 'Bucket Configuration',
          status: 'pass',
          message: `Bucket is ${audioBucket.public ? 'public' : 'private'}`,
          data: audioBucket
        });
      } else {
        results.push({
          test: 'Bucket Configuration',
          status: 'fail',
          message: 'meeting-audios bucket not found'
        });
      }

    } catch (err: any) {
      results.push({
        test: 'General Error',
        status: 'fail',
        message: err.message
      });
    }

    setTestResults(results);
    setTesting(false);
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🔍 Audio Diagnostics
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Test if your recordings are accessible and playable
        </p>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? '🔄 Testing...' : '▶️ Run Diagnostics'}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 ${
                result.status === 'pass'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {result.status === 'pass' ? '✅' : '❌'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {result.test}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>

              {result.url && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      📥 Download
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          const audio = new Audio(result.url);
                          await audio.play();
                          alert('✅ Playback started!');
                        } catch (err: any) {
                          alert(`❌ Playback failed: ${err.message}`);
                        }
                      }}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      ▶️ Test Play
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {result.url}
                  </p>
                  {result.size !== undefined && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Size: {(result.size / 1024).toFixed(2)} KB | Type: {result.contentType || 'unknown'}
                    </p>
                  )}
                </div>
              )}

              {result.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    Show raw data
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick fixes */}
      {testResults.some(r => r.status === 'fail') && (
        <div className="mt-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6 dark:bg-yellow-900/20">
          <h3 className="mb-3 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            🔧 Possible Fixes
          </h3>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            {testResults.find(r => r.test.includes('Bucket') && !r.message.includes('public')) && (
              <div>
                <strong>❌ Bucket is private</strong>
                <p className="ml-5">
                  Go to Supabase Dashboard → Storage → meeting-audios → Settings → Make bucket public
                </p>
              </div>
            )}
            {testResults.find(r => r.test.includes('File') && r.message.includes('403')) && (
              <div>
                <strong>❌ Permission denied (403)</strong>
                <p className="ml-5">
                  Check RLS policies on storage.objects table. Files may not be publicly readable.
                </p>
              </div>
            )}
            {testResults.find(r => r.test.includes('File') && r.size === 0) && (
              <div>
                <strong>❌ File is empty (0 bytes)</strong>
                <p className="ml-5">
                  The recording upload may have failed. Check extension console logs.
                </p>
              </div>
            )}
            {testResults.find(r => r.message.includes('No audio URL')) && (
              <div>
                <strong>❌ Missing audio URL</strong>
                <p className="ml-5">
                  Database record exists but audio_url is null. Upload may have failed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




