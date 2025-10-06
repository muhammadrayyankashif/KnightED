import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

interface IChapter {
  _id: string
  courseId: string
  isPublished: boolean
}

interface IEnrollment {
  userId: string
  courseId: string
}

interface ICourse {
  _id: string
  title: string
  description: string
  imageUrl: string
  categoryId?: string
  categoryIds?: string[]
  isPublished: boolean
  createdById: string
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = safeObjectIdToString(user.userId)

    const course: ICourse | null = await db.course.findOne({
      _id: resolvedParams.courseId,
      createdById: userId,
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Validate required fields
    if (!course.title) {
      return NextResponse.json({ error: 'Course title is required before publishing' }, { status: 400 })
    }
    if (!course.description) {
      return NextResponse.json({ error: 'Course description is required before publishing' }, { status: 400 })
    }
    if (!course.imageUrl) {
      return NextResponse.json({ error: 'Course image is required before publishing' }, { status: 400 })
    }

    const hasCategory = course.categoryId || (course.categoryIds && course.categoryIds.length > 0)
    if (!hasCategory) {
      return NextResponse.json({ error: 'Course category is required before publishing' }, { status: 400 })
    }

    const chapters: IChapter[] = await db.chapter.find({ courseId: resolvedParams.courseId })
    const hasPublishedChapter = chapters.some((chapter) => chapter.isPublished)

    if (!hasPublishedChapter) {
      return NextResponse.json({ error: 'At least one published chapter is required before publishing the course' }, { status: 400 })
    }

    const publishedCourse: ICourse | null = await db.course.findByIdAndUpdate(
      resolvedParams.courseId,
      { isPublished: true },
      { new: true }
    )

    if (!publishedCourse) {
      return NextResponse.json({ error: 'Failed to publish course' }, { status: 500 })
    }

    // Create notifications for students in courses with the same category
    if (publishedCourse.categoryId || publishedCourse.categoryIds?.length) {
      const categoryIds = publishedCourse.categoryIds && publishedCourse.categoryIds.length > 0
        ? publishedCourse.categoryIds
        : (publishedCourse.categoryId ? [publishedCourse.categoryId] : [])

      try {
        // Find all courses with these categories (excluding current course)
        const coursesInCategory = await db.course.find({
          $or: [
            { categoryId: { $in: categoryIds } },
            { categoryIds: { $in: categoryIds } }
          ],
          _id: { $ne: resolvedParams.courseId }
        })

        const courseIds = coursesInCategory.map((c: any) => c._id.toString())

        if (courseIds.length > 0) {
          const enrollments: IEnrollment[] = await db.enrollment.find({
            courseId: { $in: courseIds }
          })

          if (enrollments.length > 0) {
            // Create notifications for each enrolled student
            const notificationPromises = enrollments.map((enrollment: IEnrollment) =>
              db.notification.create({
                userId: enrollment.userId,
                type: 'course_update',
                content: `New course "${publishedCourse.title}" published in your interested category`,
                courseId: resolvedParams.courseId,
                read: false,
              })
            )

            await Promise.all(notificationPromises)
          }
        }
      } catch (notificationError) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Error creating notifications:', notificationError instanceof Error ? notificationError.message : notificationError)
        }
        // Continue anyway - course is already published
      }
    }

    return NextResponse.json(publishedCourse)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error publishing course:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
