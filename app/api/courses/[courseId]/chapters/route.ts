import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isTeacher } from '@/lib/teacher'

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    const { title } = await req.json()

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findOne({
      _id: resolvedParams.courseId,
      createdById: user.userId.toString(),
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const lastChapter = await db.chapter.findOne({
      courseId: resolvedParams.courseId,
    }).sort({ position: -1 })

    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    const newChapter = await db.chapter.create({
      title,
      courseId: resolvedParams.courseId,
      position: newPosition,
    })

    return NextResponse.json(newChapter)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
