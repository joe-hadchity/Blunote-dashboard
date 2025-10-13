"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StorageFile {
  name: string;
  size: number;
  created_at: string;
  url: string;
}

interface Recording {
  id: string;
  title: string;
  audio_url: string;
  recording_url: string;
  file_size: number;
  duration: number;
  created_at: string;
  storage_path: string;
  has_audio: boolean;
}

export default function TestStoragePage() {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkStorage();
  }, []);

  async function checkStorage() {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }
      setUserId(user.id);

      // 1. Check files in storage bucket
      const { data: files, error: storageError } = await supabase.storage
        .from('meeting-audios')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        setError(`Storage error: ${storageError.message}`);
      } else {
        // Get public URLs for each file
        const filesWithUrls = files.map(file => {
          const { data } = supabase.storage
            .from('meeting-audios')
            .getPublicUrl(`${user.id}/${file.name}`);
          
          return {
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            url: data.publicUrl
          };
        });
        setStorageFiles(filesWithUrls);
      }

      // 2. Check recordings in database
      const { data: dbRecordings, error: dbError } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (dbError) {
        console.error('Database error:', dbError);
        setError(`Database error: ${dbError.message}`);
      } else {
        setRecordings(dbRecordings || []);
      }

    } catch (err: any) {
      console.error('Error checking storage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function testAudioPlayback(url: string) {
    try {
      const audio = new Audio(url);
      await audio.play();
      alert('✅ Audio playback started! Check your speakers.');
    } catch (err: any) {
      alert(`❌ Audio playback failed: ${err.message}`);
    }
  }

  async function deleteFile(fileName: string) {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      const { error } = await supabase.storage
        .from('meeting-audios')
        .remove([`${userId}/${fileName}`]);

      if (error) throw error;
      
      alert('✅ File deleted');
      checkStorage();
    } catch (err: any) {
      alert(`❌ Delete failed: ${err.message}`);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔍 Storage Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Check if your extension recordings are being saved correctly
          </p>
        </div>
        <button
          onClick={checkStorage}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <p className="text-blue-900 dark:text-blue-100">Loading...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
          <p className="font-semibold text-red-900 dark:text-red-100">❌ Error:</p>
          <p className="mt-2 text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Files in Storage</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {storageFiles.length}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Recordings in DB</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {recordings.length}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatBytes(storageFiles.reduce((sum, f) => sum + f.size, 0))}
              </p>
            </div>
          </div>

          {/* Storage Files */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              📁 Files in Supabase Storage
            </h2>
            {storageFiles.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No files found</p>
            ) : (
              <div className="space-y-3">
                {storageFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatBytes(file.size)} • {new Date(file.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testAudioPlayback(file.url)}
                        className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                      >
                        ▶️ Play
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        📥 Download
                      </a>
                      <button
                        onClick={() => deleteFile(file.name)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database Recordings */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              💾 Recordings in Database
            </h2>
            {recordings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No recordings found</p>
            ) : (
              <div className="space-y-3">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatBytes(rec.file_size)} • {formatDuration(rec.duration)} • 
                        {new Date(rec.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {rec.storage_path}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {rec.audio_url && (
                        <>
                          <button
                            onClick={() => testAudioPlayback(rec.audio_url)}
                            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                          >
                            ▶️ Play
                          </button>
                          <a
                            href={`/recording/${rec.id}`}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            👁️ View
                          </a>
                        </>
                      )}
                      {!rec.has_audio && (
                        <span className="rounded bg-red-100 px-3 py-1 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                          ⚠️ No audio URL
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Check */}
          <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-6 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              ✅ Health Check
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {storageFiles.length > 0 ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Files are being uploaded to Supabase Storage
                </span>
              </div>
              <div className="flex items-center gap-2">
                {recordings.length > 0 ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Recordings are being saved to database
                </span>
              </div>
              <div className="flex items-center gap-2">
                {storageFiles.length === recordings.length ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-yellow-600">⚠️</span>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Storage and database are in sync ({storageFiles.length} files = {recordings.length} records)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {recordings.every(r => r.has_audio) ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  All recordings have audio URLs
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}




