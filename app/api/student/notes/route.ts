import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await db.note.find({ isPublished: true }).sort({ createdAt: -1 })
    const categories = await db.category.find({})

    const userProgress = await db.noteProgress.find({ userId: user.userId })

    const notesWithProgress = await Promise.all(
      notes.map(async (note) => {
        const category = categories.find(cat => cat._id.toString() === note.categoryId)
        const progress = userProgress.find(p => p.noteId === note._id.toString())
        
        return {
          _id: note._id.toString(),
          title: note.title,
          fileUrl: note.fileUrl,
          fileName: note.fileName,
          categoryId: note.categoryId,
          categoryName: category?.name || 'Unknown',
          isCompleted: progress?.isCompleted || false,
          completedAt: progress?.completedAt?.toISOString() || null,
          createdAt: note.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json(notesWithProgress)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
