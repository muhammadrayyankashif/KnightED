export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function POST(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isCompleted } = await req.json()

    const note = await db.note.findOne({ _id: noteId, isPublished: true })
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const progress = await db.noteProgress.findOneAndUpdate(
      { userId: user.userId, noteId },
      {
        userId: user.userId,
        noteId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      { upsert: true, new: true },
    )

    return NextResponse.json({
      _id: progress._id.toString(),
      userId: progress.userId,
      noteId: progress.noteId,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt?.toISOString() || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
