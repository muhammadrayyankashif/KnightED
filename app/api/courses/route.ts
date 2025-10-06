import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isTeacher } from '@/lib/teacher'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(request)
    const { title } = await request.json()

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = safeObjectIdToString(user.userId)

    const course = await db.course.create({
      title,
      createdById: userId,
    })

    const serializedCourse = {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      isPublished: course.isPublished,
      createdById: course.createdById.toString(),
      categoryId: course.categoryId?.toString(),
      categoryIds: course.categoryIds?.map((id: any) => id.toString()) || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }

    return NextResponse.json(serializedCourse)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
