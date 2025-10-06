import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isTeacher } from '@/lib/teacher'

export async function PATCH(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const user = await getCurrentUser(req as NextRequest)
    const { courseId } = await params
    const values = await req.json()

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const updateData: any = {
      title: values?.title,
      description: values?.description,
      imageUrl: values?.imageUrl,
    }

    if (values?.categoryIds !== undefined) {
      updateData.categoryIds = values.categoryIds
      updateData.categoryId = values.categoryIds && values.categoryIds.length > 0 ? values.categoryIds[0] : null
    } else if (values?.categoryId !== undefined) {
      updateData.categoryId = values.categoryId
      updateData.categoryIds = values.categoryId ? [values.categoryId] : []
    }

    const course = await db.course.findOneAndUpdate(
      {
        _id: courseId,
        createdById: user.userId.toString(),
      },
      updateData,
      { new: true }
    )

    return NextResponse.json(course)
  } catch {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const { courseId } = await params
    const user = await getCurrentUser(req)

    if (!user || !isTeacher(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = safeObjectIdToString(user.userId)

    const course = await db.course.findOne({
      _id: courseId,
      createdById: userId,
    })

    if (!course) {
      return new NextResponse('Not found', { status: 404 })
    }

    await db.chapter.deleteMany({ courseId })
    await db.attachment.deleteMany({ courseId })
    await db.enrollment.deleteMany({ courseId })
    await db.userProgress.deleteMany({ courseId })
    
    const deletedCourse = await db.course.findByIdAndDelete(courseId)

    return NextResponse.json(deletedCourse)
  } catch (error) {
    return new NextResponse('Internal server exception', { status: 500 })
  }
}
