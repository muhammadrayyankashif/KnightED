import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Safely convert ObjectId to string
    const userId = safeObjectIdToString(user.userId)

    const course = await db.course.findOne({
      _id: resolvedParams.courseId,
      createdById: userId,
    })

    if (!course) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const unpublishedCourse = await db.course.findByIdAndUpdate(
      resolvedParams.courseId,
      { isPublished: false },
      { new: true }
    )

    return NextResponse.json(unpublishedCourse)
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
