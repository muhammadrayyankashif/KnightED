import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getProgressDetails } from '@/actions/get-progress'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookmarks = await db.bookmark.find({ userId: user.userId.toString() })
    
    // Get course details for each bookmark
    const bookmarksWithCourses = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const course = await db.course.findById(bookmark.courseId)
        if (!course) return null
        
        // Get chapters for the course
        const chapters = await db.chapter.find({ 
          courseId: course._id, 
          isPublished: true 
        }).select('_id')
        
        // Check if user is enrolled and get progress
        const enrollment = await db.enrollment.findOne({ userId: user.userId.toString(), courseId: course._id })
        let progress = null
        let progressDetails = null
        
        if (enrollment) {
          const progressData = await getProgressDetails(user.userId.toString(), course._id)
          progress = progressData.progressPercentage
          progressDetails = {
            completedVideos: progressData.completedVideos,
            totalVideos: progressData.totalVideos,
          }
        }

        return {
          _id: bookmark._id.toString(),
          courseId: bookmark.courseId,
          course: {
            _id: course._id.toString(),
            title: course.title,
            description: course.description,
            imageUrl: course.imageUrl,
            isPublished: course.isPublished,
            isFeatured: course.isFeatured === true,
            createdById: course.createdById,
            categoryId: course.categoryId,
            categoryIds: course.categoryIds,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            chapters: chapters.map(chapter => ({ _id: chapter._id.toString() })),
            progress,
            progressDetails,
          },
          createdAt: bookmark.createdAt,
          updatedAt: bookmark.updatedAt,
        }
      })
    )

    // Filter out null values (courses that might have been deleted)
    const validBookmarks = bookmarksWithCourses.filter(bookmark => bookmark !== null)

    return NextResponse.json(validBookmarks)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await req.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Check if course exists
    const course = await db.course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if bookmark already exists
    const existingBookmark = await db.bookmark.findOne({
        userId: user.userId.toString(),
        courseId,
    })

    if (existingBookmark) {
      return NextResponse.json({ error: 'Course already bookmarked' }, { status: 400 })
    }

    // Create bookmark
    const bookmark = await db.bookmark.create({
        userId: user.userId.toString(),
        courseId,
    })

    return NextResponse.json({
      _id: bookmark._id.toString(),
      courseId: bookmark.courseId,
      userId: bookmark.userId,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
