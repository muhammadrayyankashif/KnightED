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
    // eslint-disable-next-line
    const { isPublished, ...values } = await req.json()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const ownCourse = await db.course.findOne({ _id: resolvedParams.courseId, createdById: user.userId.toString() })
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const chapter = await db.chapter.findByIdAndUpdate(resolvedParams.chapterId, values, { new: true })

    // Video URL updated - no MUX data needed since we're using direct video URLs

    // Serialize the chapter object to avoid serialization issues
    const serializedChapter = {
      _id: chapter._id.toString(),
      title: chapter.title,
      position: chapter.position,
      isPublished: chapter.isPublished,
      isFree: chapter.isFree,
      courseId: chapter.courseId.toString(),
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      description: chapter.description,
      videoUrl: chapter.videoUrl,
      videos: chapter.videos || [],
    }

    return NextResponse.json(serializedChapter)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
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

    const chapter = await db.chapter.findOne({
      _id: resolvedParams.chapterId,
      courseId: resolvedParams.courseId,
    })
    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 })
    }

    // No MUX data to clean up since we're using direct video URLs

    const deletedChapter = await db.chapter.findByIdAndDelete(resolvedParams.chapterId)

    const publishedChaptersInCourse = await db.chapter.countDocuments({
      courseId: resolvedParams.courseId,
      isPublished: true,
    })

    if (!publishedChaptersInCourse) {
      await db.course.findOneAndUpdate(
        { _id: resolvedParams.courseId },
        { isPublished: false }
      )
    }

    // Serialize the deleted chapter object to avoid serialization issues
    const serializedDeletedChapter = deletedChapter ? {
      _id: deletedChapter._id.toString(),
      title: deletedChapter.title,
      position: deletedChapter.position,
      isPublished: deletedChapter.isPublished,
      isFree: deletedChapter.isFree,
      courseId: deletedChapter.courseId.toString(),
      createdAt: deletedChapter.createdAt,
      updatedAt: deletedChapter.updatedAt,
      description: deletedChapter.description,
      videoUrl: deletedChapter.videoUrl,
      videos: deletedChapter.videos || [],
    } : null

    return NextResponse.json(serializedDeletedChapter)
  } catch {
    return new NextResponse('Internal server error', { status: 500 })
  }
}
