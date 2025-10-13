"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadFile, validateFile } from '@/lib/storage';
import { Upload, Video, Mic, FileText, CheckCircle, XCircle, Loader2 } from '@/components/common/Icons';

export default function TestUploadPage() {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('Test Meeting');
  const [description, setDescription] = useState('Testing video and audio upload');
  const [platform, setPlatform] = useState<'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS'>('GOOGLE_MEET');
  
  // Upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  
  // Progress state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    video?: 'uploading' | 'done' | 'error';
    audio?: 'uploading' | 'done' | 'error';
    transcript?: 'uploading' | 'done' | 'error';
  }>({});
  
  const [result, setResult] = useState<{ success: boolean; message: string; meetingId?: string } | null>(null);

  const handleFileChange = (type: 'video' | 'audio' | 'transcript', file: File | null) => {
    if (!file) return;
    
    // Validate file
    let allowedTypes: string[] = [];
    let maxSize = 500;
    
    if (type === 'video') {
      allowedTypes = ['video/*'];
      maxSize = 500;
    } else if (type === 'audio') {
      allowedTypes = ['audio/*'];
      maxSize = 100;
    } else {
      allowedTypes = ['text/plain', 'application/json', 'text/vtt'];
      maxSize = 10;
    }
    
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    if (type === 'video') setVideoFile(file);
    else if (type === 'audio') setAudioFile(file);
    else setTranscriptFile(file);
  };

  const handleUpload = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    if (!videoFile && !audioFile) {
      alert('Please select at least a video or audio file');
      return;
    }

    setUploading(true);
    setResult(null);
    setUploadProgress({});

    try {
      let videoUrl: string | null = null;
      let audioUrl: string | null = null;
      let transcriptUrl: string | null = null;

      // Upload video
      if (videoFile) {
        setUploadProgress(prev => ({ ...prev, video: 'uploading' }));
        const videoResult = await uploadFile(videoFile, 'meeting-videos', user.id);
        
        if ('error' in videoResult) {
          setUploadProgress(prev => ({ ...prev, video: 'error' }));
          throw new Error(`Video upload failed: ${videoResult.error}`);
        }
        
        videoUrl = videoResult.url;
        setUploadProgress(prev => ({ ...prev, video: 'done' }));
      }

      // Upload audio
      if (audioFile) {
        setUploadProgress(prev => ({ ...prev, audio: 'uploading' }));
        const audioResult = await uploadFile(audioFile, 'meeting-audios', user.id);
        
        if ('error' in audioResult) {
          setUploadProgress(prev => ({ ...prev, audio: 'error' }));
          throw new Error(`Audio upload failed: ${audioResult.error}`);
        }
        
        audioUrl = audioResult.url;
        setUploadProgress(prev => ({ ...prev, audio: 'done' }));
      }

      // Upload transcript
      if (transcriptFile) {
        setUploadProgress(prev => ({ ...prev, transcript: 'uploading' }));
        const transcriptResult = await uploadFile(transcriptFile, 'meeting-transcripts', user.id);
        
        if ('error' in transcriptResult) {
          setUploadProgress(prev => ({ ...prev, transcript: 'error' }));
          throw new Error(`Transcript upload failed: ${transcriptResult.error}`);
        }
        
        transcriptUrl = transcriptResult.url;
        setUploadProgress(prev => ({ ...prev, transcript: 'done' }));
      }

      // Create meeting with uploaded files
      const meetingData = {
        title,
        description,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        platform,
        type: 'VIDEO',
        status: 'COMPLETED',
        recordingUrl: videoUrl || audioUrl, // Use video URL as primary, fallback to audio
        audioUrl: audioUrl,
        transcriptUrl: transcriptUrl,
        hasVideo: !!videoUrl,
        hasTranscript: !!transcriptUrl,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }

      const data = await response.json();
      
      setResult({
        success: true,
        message: 'Meeting created successfully with uploaded files!',
        meetingId: data.meeting?.id,
      });

      // Reset form
      setVideoFile(null);
      setAudioFile(null);
      setTranscriptFile(null);
      setTitle('Test Meeting');
      setDescription('Testing video and audio upload');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: error.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const StatusIcon = ({ status }: { status?: string }) => {
    if (status === 'uploading') return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (status === 'done') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Test File Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload video, audio, and transcript files to test storage integration
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Meeting Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="GOOGLE_MEET">Google Meet</option>
              <option value="ZOOM">Zoom</option>
              <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
            </select>
          </div>
        </div>

        {/* File Upload Sections */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Files</h2>

          {/* Video Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Video File</span>
              </div>
              <StatusIcon status={uploadProgress.video} />
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
            />
            {videoFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Audio Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">Audio File</span>
              </div>
              <StatusIcon status={uploadProgress.audio} />
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange('audio', e.target.files?.[0] || null)}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-400"
            />
            {audioFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Transcript Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Transcript File (Optional)</span>
              </div>
              <StatusIcon status={uploadProgress.transcript} />
            </div>
            <input
              type="file"
              accept=".txt,.json,.vtt"
              onChange={(e) => handleFileChange('transcript', e.target.files?.[0] || null)}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-400"
            />
            {transcriptFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {transcriptFile.name} ({(transcriptFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || (!videoFile && !audioFile)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Create Meeting
            </>
          )}
        </button>

        {/* Result Message */}
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
            {result.success && result.meetingId && (
              <div className="mt-2">
                <a
                  href={`/meeting/${result.meetingId}`}
                  className="text-sm underline hover:no-underline"
                >
                  View Meeting →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">📝 Instructions:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Select at least one video or audio file</li>
            <li>Maximum video size: 500MB</li>
            <li>Maximum audio size: 100MB</li>
            <li>Transcript file is optional (for testing)</li>
            <li>Files will be uploaded to Supabase Storage</li>
            <li>A new meeting will be created with the uploaded URLs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




