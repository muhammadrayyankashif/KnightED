export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function POST(req: NextRequest, { params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isCompleted } = await req.json()

    const pastPaper = await db.pastPaper.findOne({ _id: paperId, isPublished: true })
    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 })
    }

    const progress = await db.pastPaperProgress.findOneAndUpdate(
      { userId: user.userId, pastPaperId: paperId },
      {
        userId: user.userId,
        pastPaperId: paperId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      { upsert: true, new: true },
    )

    return NextResponse.json({
      _id: progress._id.toString(),
      userId: progress.userId,
      pastPaperId: progress.pastPaperId,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt?.toISOString() || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
