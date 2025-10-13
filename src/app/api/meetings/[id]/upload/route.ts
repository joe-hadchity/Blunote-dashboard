import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id: meetingId } = await params
    
    // Get user from token (support both cookie and Authorization header for extension)
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      console.error('❌ Upload failed: No access token')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      console.error('❌ Upload failed: Invalid session', error)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    console.log(`📤 Upload request from user ${user.id} for meeting ${meetingId}`)

    // Verify meeting exists and belongs to user
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .select('id')
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string // 'video' | 'audio' | 'transcript'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!fileType || !['video', 'audio', 'transcript'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be video, audio, or transcript' },
        { status: 400 }
      )
    }

    // Determine bucket based on file type
    const bucketName = fileType === 'video' ? 'meeting-videos' :
                       fileType === 'audio' ? 'meeting-audios' :
                       'meeting-transcripts'

    // Create file path: {user_id}/{meeting_id}/{filename}
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${meetingId}/${Date.now()}-${file.name}`

    console.log(`📁 Uploading ${fileType} to ${bucketName}/${fileName}`)
    console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded to storage:', uploadData.path)

    // Get public URL (for private buckets, this creates a signed URL)
    const { data: urlData } = await supabaseAdmin
      .storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000) // 1 year expiry

    const fileUrl = urlData?.signedUrl || ''

    console.log('🔗 Generated signed URL')

    // Save file metadata to database
    if (fileType === 'video') {
      const { error: dbError } = await supabaseAdmin
        .from('meeting_videos')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          processing_status: 'completed',
          storage_provider: 'supabase',
          storage_key: fileName,
        })

      if (dbError) {
        console.error('❌ Database error (video):', dbError)
        return NextResponse.json(
          { error: 'Failed to save video metadata' },
          { status: 500 }
        )
      }
      console.log('✅ Video metadata saved to database')
    } else if (fileType === 'audio') {
      const { error: dbError } = await supabaseAdmin
        .from('meeting_audios')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          processing_status: 'completed',
          storage_provider: 'supabase',
          storage_key: fileName,
        })

      if (dbError) {
        console.error('❌ Database error (audio):', dbError)
        return NextResponse.json(
          { error: 'Failed to save audio metadata' },
          { status: 500 }
        )
      }
      console.log('✅ Audio metadata saved to database')
    } else if (fileType === 'transcript') {
      // For transcript, read file content if it's a text file
      const transcriptText = await file.text()
      
      const { error: dbError } = await supabaseAdmin
        .from('meeting_transcripts')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          full_transcript: transcriptText,
          file_url: fileUrl,
          file_format: fileExt,
          language: 'en',
          transcription_service: 'manual_upload',
          processing_status: 'completed',
        })

      if (dbError) {
        console.error('❌ Database error (transcript):', dbError)
        return NextResponse.json(
          { error: 'Failed to save transcript' },
          { status: 500 }
        )
      }
      console.log('✅ Transcript saved to database')
    }

    console.log(`✅ ${fileType} upload complete for meeting ${meetingId}`)

    return NextResponse.json({
      success: true,
      message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    }, { status: 200 })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


