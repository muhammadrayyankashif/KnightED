import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Params = Promise<{ chapterId: string; courseId: string }>

interface IEnrollment {
  userId: string
  courseId: string
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    await connectDB()
    const { chapterId, courseId } = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownCourse = await db.course.findOne({ _id: courseId, createdById: user.userId.toString() })
    if (!ownCourse) {
      return NextResponse.json({ error: 'Unauthorized - you do not own this course' }, { status: 401 })
    }

    const chapter = await db.chapter.findOne({ _id: chapterId, courseId })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    if (!chapter.title) {
      return NextResponse.json({ error: 'Chapter must have a title to publish' }, { status: 400 })
    }

    const hasVideoContent = chapter.videoUrl || (chapter.videos && chapter.videos.length > 0)
    if (!hasVideoContent) {
      return NextResponse.json({ error: 'Chapter must have at least one video to publish' }, { status: 400 })
    }

    const publishedChapter = await db.chapter.findOneAndUpdate(
      { _id: chapterId, courseId },
      { isPublished: true },
      { new: true }
    )

    if (!publishedChapter) {
      return NextResponse.json({ error: 'Failed to publish chapter' }, { status: 500 })
    }

    // Create notifications for students enrolled in this course
    const enrollments: IEnrollment[] = await db.enrollment.find({ courseId })

    if (enrollments.length > 0) {
      const notificationPromises = enrollments.map((enrollment: IEnrollment) =>
        db.notification.create({
          userId: enrollment.userId,
          type: 'chapter_upload',
          content: `New chapter "${publishedChapter.title}" uploaded to "${ownCourse.title}"`,
          courseId,
          chapterId,
          read: false,
        })
      )

      try {
        await Promise.all(notificationPromises)
      } catch (notificationError) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Error creating notifications:', notificationError instanceof Error ? notificationError.message : notificationError)
        }
        // Continue anyway - chapter is already published
      }
    }

    const serializedChapter = {
      _id: publishedChapter._id.toString(),
      title: publishedChapter.title,
      position: publishedChapter.position,
      isPublished: publishedChapter.isPublished,
      isFree: publishedChapter.isFree,
      courseId: publishedChapter.courseId.toString(),
      createdAt: publishedChapter.createdAt,
      updatedAt: publishedChapter.updatedAt,
      description: publishedChapter.description,
      videoUrl: publishedChapter.videoUrl,
      videos: publishedChapter.videos || [],
    }

    return NextResponse.json(serializedChapter)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error publishing chapter:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
