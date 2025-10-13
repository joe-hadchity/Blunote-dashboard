"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAudioPage() {
  const [audioUrl, setAudioUrl] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  async function testLatestRecording() {
    setTesting(true);
    setTestResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTestResults({ error: 'Not logged in' });
        setTesting(false);
        return;
      }

      // Get latest recording
      const { data: recording } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!recording) {
        setTestResults({ error: 'No recordings found' });
        setTesting(false);
        return;
      }

      const url = recording.audio_url || recording.recording_url;
      setAudioUrl(url);

      // Test URL
      const results: any = {
        recording_id: recording.id,
        title: recording.title,
        created_at: recording.created_at,
        file_size: recording.file_size,
        duration: recording.duration,
        audio_url: url,
        storage_path: recording.storage_path,
      };

      // Fetch the file
      console.log('Fetching:', url);
      const response = await fetch(url);
      
      results.http_status = response.status;
      results.http_ok = response.ok;
      results.content_type = response.headers.get('content-type');
      results.content_length = response.headers.get('content-length');

      if (response.ok) {
        const blob = await response.blob();
        results.actual_size = blob.size;
        results.blob_type = blob.type;
        
        // Create object URL for testing
        const objectUrl = URL.createObjectURL(blob);
        results.object_url = objectUrl;

        // Try to play
        const audio = new Audio(objectUrl);
        
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            results.audio_duration = audio.duration;
            results.can_play = true;
            resolve(true);
          };
          
          audio.onerror = (e) => {
            results.can_play = false;
            results.audio_error = audio.error?.message || 'Unknown error';
            reject(e);
          };
          
          setTimeout(() => {
            if (!results.can_play && results.can_play !== false) {
              results.timeout = true;
              resolve(false);
            }
          }, 5000);
        }).catch(() => {});
      } else {
        results.error_body = await response.text();
      }

      setTestResults(results);
    } catch (err: any) {
      setTestResults({ error: err.message });
    } finally {
      setTesting(false);
    }
  }

  async function downloadAndCheck() {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'test-recording.webm';
    a.click();
    
    alert('Download started. Check your Downloads folder and try opening the file in VLC or another media player.');
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        🔍 Audio Debug Tool
      </h1>

      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          This tool will test your most recent recording and tell you exactly why it's not playing.
        </p>
      </div>

      <button
        onClick={testLatestRecording}
        disabled={testing}
        className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? '🔄 Testing...' : '🔬 Test Latest Recording'}
      </button>

      {testResults && (
        <div className="space-y-4">
          {testResults.error && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="font-semibold text-red-900 dark:text-red-100">❌ Error</p>
              <p className="text-red-700 dark:text-red-200">{testResults.error}</p>
            </div>
          )}

          {!testResults.error && (
            <>
              {/* Basic Info */}
              <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">📋 Recording Info</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Title:</strong> {testResults.title}</p>
                  <p><strong>ID:</strong> {testResults.recording_id}</p>
                  <p><strong>Created:</strong> {new Date(testResults.created_at).toLocaleString()}</p>
                  <p><strong>Database Size:</strong> {testResults.file_size} bytes ({(testResults.file_size / 1024).toFixed(2)} KB)</p>
                  <p><strong>Duration:</strong> {testResults.duration} seconds</p>
                  <p><strong>Storage Path:</strong> {testResults.storage_path}</p>
                </div>
              </div>

              {/* HTTP Status */}
              <div className={`rounded-lg p-4 ${testResults.http_ok ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <h3 className="mb-3 font-semibold">🌐 HTTP Response</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Status:</strong> {testResults.http_status} {testResults.http_ok ? '✅' : '❌'}</p>
                  <p><strong>Content-Type:</strong> {testResults.content_type || 'Not set'}</p>
                  <p><strong>Content-Length:</strong> {testResults.content_length || 'Not set'}</p>
                  {testResults.error_body && <p><strong>Error:</strong> {testResults.error_body}</p>}
                </div>
              </div>

              {/* File Analysis */}
              {testResults.actual_size !== undefined && (
                <div className={`rounded-lg p-4 ${testResults.actual_size > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <h3 className="mb-3 font-semibold">📦 File Analysis</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Actual Size:</strong> {testResults.actual_size} bytes ({(testResults.actual_size / 1024).toFixed(2)} KB)</p>
                    <p><strong>Blob Type:</strong> {testResults.blob_type}</p>
                    <p>
                      <strong>Status:</strong> {' '}
                      {testResults.actual_size === 0 
                        ? '❌ File is EMPTY! Recording failed.'
                        : testResults.actual_size < 1000
                        ? '⚠️ File is very small, might be corrupted'
                        : '✅ File has data'}
                    </p>
                  </div>
                </div>
              )}

              {/* Playback Test */}
              {testResults.can_play !== undefined && (
                <div className={`rounded-lg p-4 ${testResults.can_play ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <h3 className="mb-3 font-semibold">▶️ Playback Test</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Can Play:</strong> {testResults.can_play ? '✅ Yes' : '❌ No'}</p>
                    {testResults.audio_duration && <p><strong>Audio Duration:</strong> {testResults.audio_duration.toFixed(2)}s</p>}
                    {testResults.audio_error && <p><strong>Error:</strong> {testResults.audio_error}</p>}
                    {testResults.timeout && <p><strong>Status:</strong> ⚠️ Timed out loading</p>}
                  </div>
                </div>
              )}

              {/* Test Player */}
              {testResults.object_url && testResults.actual_size > 0 && (
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">🎵 Test Player</h3>
                  <audio controls className="w-full" src={testResults.object_url}>
                    Your browser does not support audio playback.
                  </audio>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Try playing the audio above. If it doesn't work, the file may be corrupted.
                  </p>
                </div>
              )}

              {/* URL */}
              <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">🔗 URL</h3>
                <p className="break-all text-xs text-gray-600 dark:text-gray-400">{testResults.audio_url}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={downloadAndCheck}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    📥 Download File
                  </button>
                  <a
                    href={testResults.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  >
                    🔗 Open in New Tab
                  </a>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <h3 className="mb-3 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  💡 Diagnosis
                </h3>
                <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                  {testResults.actual_size === 0 && (
                    <div>
                      <p className="font-semibold">❌ FILE IS EMPTY</p>
                      <p className="ml-5">The recording process is not capturing any audio. Check:</p>
                      <ul className="ml-10 list-disc">
                        <li>Extension console logs (offscreen.js) - are chunks being recorded?</li>
                        <li>Is your microphone/tab audio actually active during recording?</li>
                        <li>Check Chrome permissions for tab audio capture</li>
                      </ul>
                    </div>
                  )}
                  
                  {testResults.http_status === 403 && (
                    <div>
                      <p className="font-semibold">❌ PERMISSION DENIED (403)</p>
                      <p className="ml-5">The bucket is still private. Run the SQL fix:</p>
                      <pre className="ml-5 mt-2 rounded bg-gray-800 p-2 text-xs text-white">
UPDATE storage.buckets SET public = true WHERE id = 'meeting-audios';
                      </pre>
                    </div>
                  )}

                  {testResults.http_status === 404 && (
                    <div>
                      <p className="font-semibold">❌ FILE NOT FOUND (404)</p>
                      <p className="ml-5">The file doesn't exist in storage. Upload failed.</p>
                    </div>
                  )}

                  {testResults.actual_size > 0 && !testResults.can_play && (
                    <div>
                      <p className="font-semibold">❌ FILE EXISTS BUT WON'T PLAY</p>
                      <p className="ml-5">Possible causes:</p>
                      <ul className="ml-10 list-disc">
                        <li>Corrupted recording</li>
                        <li>Wrong MIME type: {testResults.blob_type}</li>
                        <li>Browser doesn't support this format</li>
                        <li>Try downloading and opening in VLC</li>
                      </ul>
                    </div>
                  )}

                  {testResults.can_play && (
                    <div>
                      <p className="font-semibold">✅ AUDIO SHOULD WORK!</p>
                      <p className="ml-5">The file is valid and playable. If the player on the recording page doesn't work, check the console for errors.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Data */}
              <details className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                  🔍 Raw Debug Data
                </summary>
                <pre className="mt-3 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-900">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
}




