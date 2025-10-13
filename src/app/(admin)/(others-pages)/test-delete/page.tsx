"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Recording {
  id: string;
  title: string;
  created_at: string;
  file_size: number;
}

export default function TestDeletePage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLog, setDeleteLog] = useState<string[]>([]);

  useEffect(() => {
    loadRecordings();
  }, []);

  async function loadRecordings() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addLog('❌ Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('recordings')
        .select('id, title, created_at, file_size')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        addLog(`❌ Error loading: ${error.message}`);
      } else {
        setRecordings(data || []);
        addLog(`✅ Loaded ${data?.length || 0} recordings`);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function testDelete(id: string, title: string) {
    addLog(`\n🔄 Testing delete for: ${title} (${id})`);
    
    try {
      addLog('Sending DELETE request...');
      const response = await fetch(`/api/recordings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      addLog(`Response status: ${response.status}`);

      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data)}`);

      if (response.ok) {
        addLog('✅ Delete successful!');
        addLog('Reloading recordings...');
        await loadRecordings();
      } else {
        addLog(`❌ Delete failed: ${data.error}`);
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    }
  }

  function addLog(message: string) {
    setDeleteLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }

  function clearLog() {
    setDeleteLog([]);
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        🧪 Delete Test Tool
      </h1>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Recordings List */}
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Recordings
            </h2>
            <button
              onClick={loadRecordings}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          ) : recordings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No recordings found</p>
          ) : (
            <div className="space-y-2">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(rec.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      ID: {rec.id.slice(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={() => testDelete(rec.id, rec.title)}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console Log */}
        <div className="rounded-lg bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Console Log</h2>
            <button
              onClick={clearLog}
              className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 overflow-auto rounded bg-black p-3" style={{ maxHeight: '500px' }}>
            {deleteLog.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click delete on a recording.</p>
            ) : (
              deleteLog.map((log, idx) => (
                <div key={idx} className="font-mono text-xs text-green-400">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-6 dark:bg-blue-900/20">
        <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
          📋 How to Use
        </h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>Click <strong>"🗑️ Delete"</strong> on any recording</li>
          <li>Watch the console log on the right</li>
          <li>Check if "Delete successful!" appears</li>
          <li>Check if recording disappears from the list</li>
          <li>Also check your browser console (F12) and backend terminal</li>
        </ol>
      </div>

      {/* Debugging Info */}
      <div className="mt-6 rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
        <h3 className="mb-3 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
          🔍 What to Check
        </h3>
        <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
          <div>
            <strong>1. Browser Console (F12):</strong>
            <p className="ml-5">Should show: "Deleting recording: [id]", "Delete successful: ..."</p>
          </div>
          <div>
            <strong>2. Backend Terminal:</strong>
            <p className="ml-5">Should show: "DELETE request for recording: [id]", "Recording deleted successfully"</p>
          </div>
          <div>
            <strong>3. This Page:</strong>
            <p className="ml-5">Recording should disappear after successful delete</p>
          </div>
          <div>
            <strong>4. Database:</strong>
            <p className="ml-5">Open Supabase → Table Editor → recordings → Check if row is gone</p>
          </div>
        </div>
      </div>
    </div>
  );
}




