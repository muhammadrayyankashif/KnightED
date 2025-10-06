import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Progress = Promise<{
  courseId: string
  chapterId: string
}>

export async function PUT(req: NextRequest, { params }: { params: Progress }) {
  try {
    await connectDB()
    const { chapterId } = await params
    const user = await getCurrentUser(req)
    const { isCompleted } = await req.json()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userProgress = await db.userProgress.findOneAndUpdate(
      { userId: user.userId.toString(), chapterId },
      { isCompleted },
      { upsert: true, new: true }
    )

    return NextResponse.json(userProgress)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
