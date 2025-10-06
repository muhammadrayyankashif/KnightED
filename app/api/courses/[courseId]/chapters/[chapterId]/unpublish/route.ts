import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Params = Promise<{ chapterId: string; courseId: string }>

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const ownCourse = await db.course.findOne({ _id: resolvedParams.courseId, createdById: user.userId.toString() })
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const unpublishedChapter = await db.chapter.findOneAndUpdate(
      { _id: resolvedParams.chapterId, courseId: resolvedParams.courseId },
      { isPublished: false },
      { new: true }
    )

    const publishedChapters = await db.chapter.countDocuments({
      courseId: resolvedParams.courseId,
      isPublished: true,
    })
    if (!publishedChapters) {
      await db.course.findOneAndUpdate(
        { _id: resolvedParams.courseId },
        { isPublished: false }
      )
    }

    // Serialize the chapter object to avoid serialization issues
    const serializedChapter = {
      _id: unpublishedChapter._id.toString(),
      title: unpublishedChapter.title,
      position: unpublishedChapter.position,
      isPublished: unpublishedChapter.isPublished,
      isFree: unpublishedChapter.isFree,
      courseId: unpublishedChapter.courseId.toString(),
      createdAt: unpublishedChapter.createdAt,
      updatedAt: unpublishedChapter.updatedAt,
      description: unpublishedChapter.description,
      videoUrl: unpublishedChapter.videoUrl,
      videos: unpublishedChapter.videos || [],
    }

    return NextResponse.json(serializedChapter)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
