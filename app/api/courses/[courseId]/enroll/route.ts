import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await db.course.findById(resolvedParams.courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found!' }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findOne({
      userId: user.userId.toString(),
      courseId: resolvedParams.courseId,
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Create enrollment
            await db.enrollment.create({
              userId: user.userId.toString(),
              courseId: resolvedParams.courseId,
            })

    return NextResponse.json({ message: 'Successfully enrolled' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
