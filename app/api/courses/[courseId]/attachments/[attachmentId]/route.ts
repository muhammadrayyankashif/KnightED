import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isTeacher } from '@/lib/teacher'

type Attachment = Promise<{
  courseId: string
  attachmentId: string
}>

export async function DELETE(request: NextRequest, { params }: { params: Attachment }) {
  try {
    await connectDB()
    const { courseId, attachmentId } = await params
    const user = await getCurrentUser(request)

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findOne({ _id: courseId, createdById: user.userId.toString() })
    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const attachment = await db.attachment.findByIdAndDelete(attachmentId)

    return NextResponse.json(attachment)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
