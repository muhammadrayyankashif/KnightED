import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Params = Promise<{ chapterId: string; courseId: string; noteId: string }>

// PATCH - Update a note
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    const { content } = await req.json()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!content || !content.trim()) {
      return new NextResponse('Note content is required', { status: 400 })
    }

    // Find the note and verify ownership
    const note = await db.note.findOne({
      _id: resolvedParams.noteId,
      userId: user.userId.toString(),
      chapterId: resolvedParams.chapterId,
    })

    if (!note) {
      return new NextResponse('Note not found', { status: 404 })
    }

    // Update the note
    const updatedNote = await db.note.findByIdAndUpdate(
      resolvedParams.noteId,
      { 
        content: content.trim(),
        updatedAt: new Date(),
      },
      { new: true }
    )

    // Serialize the updated note
    const serializedNote = {
      _id: updatedNote._id.toString(),
      content: updatedNote.content,
      timestamp: updatedNote.timestamp,
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt,
    }

    return NextResponse.json(serializedNote)
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find the note and verify ownership
    const note = await db.note.findOne({
      _id: resolvedParams.noteId,
      userId: user.userId.toString(),
      chapterId: resolvedParams.chapterId,
    })

    if (!note) {
      return new NextResponse('Note not found', { status: 404 })
    }

    // Delete the note
    await db.note.findByIdAndDelete(resolvedParams.noteId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
