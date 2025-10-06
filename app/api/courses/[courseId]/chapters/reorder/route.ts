import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const { courseId } = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { list } = await req.json()
    const courseOwner = await db.course.findOne({ _id: courseId, createdById: user.userId.toString() })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    for (const item of list) {
      await db.chapter.findByIdAndUpdate(item.id, { position: item.position })
    }

    return new NextResponse('Success', { status: 200 })
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
