export const dynamic = 'force-dynamic'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isTeacher } from '@/lib/teacher'

type Params = Promise<{
  courseId: string
}>

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { courseId } = await params
  try {
    await connectDB()
    const user = await getCurrentUser(request)
    const { url, name, fileExtension } = await request.json()

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findOne({
      _id: courseId,
      createdById: user.userId.toString(),
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const attachment = await db.attachment.create({
      url,
      name: name || url.split('/').pop(),
      fileExtension: fileExtension || '',
      courseId,
    })

    return NextResponse.json(attachment)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
