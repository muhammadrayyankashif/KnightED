import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Params = Promise<{ chapterId: string; courseId: string }>

// GET - Fetch all notes for a chapter
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user has access to this course
    const enrollment = await db.enrollment.findOne({
      userId: user.userId.toString(),
      courseId: resolvedParams.courseId,
    })

    if (!enrollment) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get videoIndex from query params
    const { searchParams } = new URL(req.url)
    const videoIndex = searchParams.get('videoIndex')
    
    const query: any = {
      chapterId: resolvedParams.chapterId,
      userId: user.userId.toString(),
    }
    
    // Filter by videoIndex if provided
    if (videoIndex !== null) {
      query.videoIndex = parseInt(videoIndex)
    }
    
    const notes = await db.videoNote.find(query).sort({ createdAt: -1 })

    // Serialize notes
    const serializedNotes = notes.map(note => ({
      _id: note._id.toString(),
      content: note.content,
      timestamp: note.timestamp,
      videoIndex: note.videoIndex,
      chapterId: note.chapterId,
      courseId: note.courseId,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }))

    return NextResponse.json(serializedNotes)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error fetching notes:', error instanceof Error ? error.message : error)
    }
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// POST - Create a new note
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    const { content, timestamp, videoIndex } = await req.json()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!content || !content.trim()) {
      return new NextResponse('Note content is required', { status: 400 })
    }

    // Verify user has access to this course
    const enrollment = await db.enrollment.findOne({
      userId: user.userId.toString(),
      courseId: resolvedParams.courseId,
    })

    if (!enrollment) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const note = await db.videoNote.create({
      content: content.trim(),
      timestamp: timestamp || null,
      videoIndex: videoIndex || 0,
      chapterId: resolvedParams.chapterId,
      courseId: resolvedParams.courseId,
      userId: user.userId.toString(),
    })

    // Serialize the created note
    const serializedNote = {
      _id: note._id.toString(),
      content: note.content,
      timestamp: note.timestamp,
      videoIndex: note.videoIndex,
      chapterId: note.chapterId,
      courseId: note.courseId,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }

    return NextResponse.json(serializedNote, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error creating note:', error instanceof Error ? error.message : error)
    }
    return new NextResponse('Internal server error', { status: 500 })
  }
}
