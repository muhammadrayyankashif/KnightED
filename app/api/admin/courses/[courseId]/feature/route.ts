import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(request)

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const { isFeatured } = await request.json()

    if (typeof isFeatured !== 'boolean') {
      return new NextResponse('isFeatured must be a boolean', { status: 400 })
    }

    const course = await db.course.findByIdAndUpdate(
      resolvedParams.courseId,
      { isFeatured },
      { new: true }
    )

    if (!course) {
      return new NextResponse('Course not found', { status: 404 })
    }

    return NextResponse.json({
      _id: course._id.toString(),
      title: course.title,
      isFeatured: course.isFeatured,
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
