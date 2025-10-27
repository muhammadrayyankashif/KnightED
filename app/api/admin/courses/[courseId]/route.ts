import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    const { courseId } = await params

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.findById(courseId)
    if (!course) {
      return new NextResponse('Course not found', { status: 404 })
    }

    await db.chapter.deleteMany({ courseId })
    await db.attachment.deleteMany({ courseId })
    await db.enrollment.deleteMany({ courseId })
    await db.userProgress.deleteMany({ courseId })

    await db.course.findByIdAndDelete(courseId)

    return new NextResponse('Course deleted successfully', { status: 200 })
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
