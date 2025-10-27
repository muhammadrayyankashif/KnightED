import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    const { userId } = await params

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { role } = body

    if (!role || !['student', 'teacher'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    const userToUpdate = await db.user.findById(userId)
    if (!userToUpdate) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (userToUpdate.role === 'admin') {
      return new NextResponse('Cannot modify admin users', { status: 403 })
    }

    await db.user.findByIdAndUpdate(userId, { role })

    return new NextResponse('User role updated successfully', { status: 200 })
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    const { userId } = await params

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userToDelete = await db.user.findById(userId)
    if (!userToDelete) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (userToDelete.role === 'admin') {
      return new NextResponse('Cannot delete admin users', { status: 403 })
    }

    await db.enrollment.deleteMany({ userId })
    await db.userProgress.deleteMany({ userId })
    
    if (userToDelete.role === 'teacher') {
      const teacherCourses = await db.course.find({ createdById: userId })
      for (const course of teacherCourses) {
        await db.chapter.deleteMany({ courseId: course._id })
        await db.attachment.deleteMany({ courseId: course._id })
        await db.enrollment.deleteMany({ courseId: course._id })
        await db.userProgress.deleteMany({ courseId: course._id })
      }
      await db.course.deleteMany({ createdById: userId })
    }
    
    await db.user.findByIdAndDelete(userId)

    return new NextResponse('User deleted successfully', { status: 200 })
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
