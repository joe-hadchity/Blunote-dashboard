import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { supabaseAdmin } from './supabase-admin';

const speechKey = process.env.AZURE_SPEECH_KEY;
const speechRegion = process.env.AZURE_SPEECH_REGION;

if (!speechKey || !speechRegion) {
  console.warn('⚠️ Azure Speech credentials not configured. Transcription will be disabled.');
} else {
  console.log('✅ Azure Speech configured:', speechRegion);
}

export interface TranscriptionWord {
  word: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  confidence: number; // 0-1
  speaker?: number; // Speaker ID (1, 2, 3, etc.)
}

export interface TranscriptionSegment {
  speaker: number; // Speaker ID
  text: string;
  startTime: number;
  endTime: number;
  words: TranscriptionWord[];
}

export interface TranscriptionResult {
  text: string;
  words: TranscriptionWord[];
  segments: TranscriptionSegment[]; // Organized by speaker
  speakerCount: number; // Number of unique speakers
  language: string;
  duration: number; // seconds
  confidence: number;
}

/**
 * Transcribe audio file from Supabase Storage using Azure Speech Recognition
 */
export async function transcribeAudio(
  audioUrl: string,
  recordingId: string
): Promise<TranscriptionResult> {
  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech credentials not configured');
  }

  console.log(`Starting transcription for recording: ${recordingId}`);
  console.log(`Audio URL: ${audioUrl}`);

  try {
    // Update status to processing
    await supabaseAdmin
      .from('recordings')
      .update({ 
        transcription_status: 'PROCESSING',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    // Download audio file
    console.log('Downloading audio file...');
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log(`Audio downloaded: ${audioBuffer.byteLength} bytes`);

    // Create speech config with speaker diarization
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = 'en-US'; // Auto-detect or specify
    speechConfig.enableDictation(); // Better for meeting transcription
    speechConfig.requestWordLevelTimestamps(); // Get word-level timing
    speechConfig.outputFormat = sdk.OutputFormat.Detailed; // Get confidence scores
    
    // Enable speaker diarization (identify different speakers)
    speechConfig.setProperty(
      sdk.PropertyId.SpeechServiceConnection_EnableSpeakerDiarization, 
      'true'
    );

    // Create audio config from buffer
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    // Use ConversationTranscriber for speaker diarization
    const conversationTranscriber = new sdk.ConversationTranscriber(speechConfig, audioConfig);

    // Store transcription results
    let fullText = '';
    const allWords: TranscriptionWord[] = [];
    const speakerSegments: Map<number, TranscriptionSegment> = new Map();
    let detectedLanguage = 'en-US';
    let totalConfidence = 0;
    let confidenceCount = 0;
    let currentSegmentId = 0;

    // Perform continuous recognition with speaker diarization
    const result = await new Promise<TranscriptionResult>((resolve, reject) => {
      // Handle transcribed event (includes speaker info)
      conversationTranscriber.transcribed = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const text = e.result.text;
          const speakerId = (e.result as any).speakerId || 'Unknown';
          
          console.log(`[Speaker ${speakerId}] ${text}`);

          // Extract speaker number from ID (e.g., "Guest-1" -> 1)
          const speakerNumber = parseInt(speakerId.replace(/\D/g, '')) || 1;

          // Extract word-level details from JSON
          try {
            const detailResult = e.result as any;
            if (detailResult.privJson) {
              const jsonResult = JSON.parse(detailResult.privJson);
              
              // Extract words with timestamps and speaker
              if (jsonResult.NBest && jsonResult.NBest[0]?.Words) {
                const words = jsonResult.NBest[0].Words.map((w: any) => ({
                  word: w.Word,
                  startTime: w.Offset / 10000, // Convert from 100ns to ms
                  endTime: (w.Offset + w.Duration) / 10000,
                  confidence: w.Confidence || 1.0,
                  speaker: speakerNumber
                }));
                
                allWords.push(...words);
                
                // Create or update speaker segment
                if (!speakerSegments.has(currentSegmentId)) {
                  speakerSegments.set(currentSegmentId, {
                    speaker: speakerNumber,
                    text: text,
                    startTime: words[0]?.startTime || 0,
                    endTime: words[words.length - 1]?.endTime || 0,
                    words: words
                  });
                } else {
                  const segment = speakerSegments.get(currentSegmentId)!;
                  segment.text += ' ' + text;
                  segment.endTime = words[words.length - 1]?.endTime || segment.endTime;
                  segment.words.push(...words);
                }
                
                currentSegmentId++;
                
                // Track confidence
                const avgConfidence = jsonResult.NBest[0].Confidence || 1.0;
                totalConfidence += avgConfidence;
                confidenceCount++;
              }
            }
          } catch (err) {
            console.error('Error parsing detailed result:', err);
          }

          fullText += `[Speaker ${speakerNumber}] ${text}\n`;
        }
      };

      conversationTranscriber.canceled = (s, e) => {
        console.error('Transcription canceled:', e.errorDetails);
        conversationTranscriber.stopTranscribingAsync();
        
        if (e.reason === sdk.CancellationReason.Error) {
          reject(new Error(e.errorDetails || 'Transcription failed'));
        } else {
          // Get unique speaker count
          const uniqueSpeakers = new Set(allWords.map(w => w.speaker).filter(s => s !== undefined));
          
          resolve({
            text: fullText.trim(),
            words: allWords,
            segments: Array.from(speakerSegments.values()),
            speakerCount: uniqueSpeakers.size,
            language: detectedLanguage,
            duration: allWords.length > 0 ? allWords[allWords.length - 1].endTime / 1000 : 0,
            confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
          });
        }
      };

      conversationTranscriber.sessionStopped = (s, e) => {
        console.log('Transcription session stopped');
        conversationTranscriber.stopTranscribingAsync();
        
        // Get unique speaker count
        const uniqueSpeakers = new Set(allWords.map(w => w.speaker).filter(s => s !== undefined));
        
        resolve({
          text: fullText.trim(),
          words: allWords,
          segments: Array.from(speakerSegments.values()),
          speakerCount: uniqueSpeakers.size,
          language: detectedLanguage,
          duration: allWords.length > 0 ? allWords[allWords.length - 1].endTime / 1000 : 0,
          confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
        });
      };

      // Start transcription
      conversationTranscriber.startTranscribingAsync(
        () => {
          console.log('Conversation transcription started (with speaker diarization)');
        },
        (err) => {
          console.error('Failed to start transcription:', err);
          reject(new Error(err));
        }
      );

      // Set timeout (max 10 minutes for transcription)
      setTimeout(() => {
        conversationTranscriber.stopTranscribingAsync();
      }, 600000);
    });

    console.log(`Transcription completed: ${allWords.length} words, ${result.speakerCount} speakers`);

    // Format transcript with speaker labels
    const formattedTranscript = result.segments
      .map(seg => `Speaker ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

    // Plain text without speaker labels (for search)
    const plainText = result.segments
      .map(seg => seg.text)
      .join(' ');

    // Check if transcript is actually empty (no speech detected)
    if (!formattedTranscript || formattedTranscript.trim().length === 0) {
      console.warn('⚠️ No speech detected in audio - transcript is empty');
      
      // Update recording status to indicate no speech detected
      await supabaseAdmin
        .from('recordings')
        .update({ 
          transcription_status: 'COMPLETED',
          has_transcript: false,
          error_message: 'No speech detected in recording',
          updated_at: new Date().toISOString()
        })
        .eq('id', recordingId);

      throw new Error('No speech detected in recording. The audio may be silent or contain only background noise.');
    }

    // Save formatted transcript to storage (optional, for download)
    const transcriptPath = `${recordingId}/transcript.txt`;
    
    const { error: transcriptUploadError } = await supabaseAdmin.storage
      .from('meeting-transcripts')
      .upload(transcriptPath, formattedTranscript, {
        contentType: 'text/plain',
        upsert: true
      });

    if (transcriptUploadError) {
      console.error('Failed to upload transcript file:', transcriptUploadError);
    }

    // Generate signed URL for transcript file
    const { data: transcriptUrlData } = await supabaseAdmin.storage
      .from('meeting-transcripts')
      .createSignedUrl(transcriptPath, 31536000); // 1 year

    const transcriptUrl = transcriptUrlData?.signedUrl || null;

    // Get user_id from recording
    const { data: recordingData } = await supabaseAdmin
      .from('recordings')
      .select('user_id')
      .eq('id', recordingId)
      .single();

    const userId = recordingData?.user_id;

    if (!userId) {
      throw new Error('Could not find user for recording');
    }

    // Save transcript to separate transcripts table (better performance)
    const { error: transcriptInsertError } = await supabaseAdmin
      .from('transcripts')
      .insert({
        recording_id: recordingId,
        user_id: userId,
        text: formattedTranscript, // With speaker labels
        plain_text: plainText, // Without labels (for search)
        segments: result.segments,
        words: allWords,
        speaker_count: result.speakerCount,
        language: result.language,
        confidence: result.confidence,
        duration_seconds: Math.floor(result.duration),
        status: 'COMPLETED'
      });

    if (transcriptInsertError) {
      console.error('Failed to insert transcript:', transcriptInsertError);
      throw new Error(`Failed to save transcript: ${transcriptInsertError.message}`);
    }

    // Update recording status
    await supabaseAdmin
      .from('recordings')
      .update({
        transcript_url: transcriptUrl,
        has_transcript: true,
        transcription_status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    console.log(`✅ Transcript saved to transcripts table (${result.speakerCount} speakers detected)`);

    return result;

  } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Update status to failed
    await supabaseAdmin
      .from('recordings')
      .update({ 
        transcription_status: 'FAILED',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    throw error;
  }
}

/**
 * Check if Azure Speech is configured
 */
export function isAzureSpeechConfigured(): boolean {
  return !!(speechKey && speechRegion);
}

/**
 * Get supported languages for transcription
 */
export function getSupportedLanguages() {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
  ];
}

