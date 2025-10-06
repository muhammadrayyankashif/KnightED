import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getProgress, getProgressDetails } from '@/actions/get-progress'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get featured courses - only those explicitly set to true
    const courses = await db.course.find({ 
      isPublished: true, 
      isFeatured: true 
    }).sort({ createdAt: -1 })

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        // Get category separately - support both single and multiple categories
        let category = null
        if (course.categoryId) {
          const categoryDoc = await db.category.findById(course.categoryId)
          if (categoryDoc) {
            category = {
              _id: categoryDoc._id.toString(),
              name: categoryDoc.name,
              createdAt: categoryDoc.createdAt,
              updatedAt: categoryDoc.updatedAt,
            }
          }
        } else if (course.categoryIds && course.categoryIds.length > 0) {
          // For multiple categories, get the first one for display
          const categoryDoc = await db.category.findById(course.categoryIds[0])
          if (categoryDoc) {
            category = {
              _id: categoryDoc._id.toString(),
              name: categoryDoc.name,
              createdAt: categoryDoc.createdAt,
              updatedAt: categoryDoc.updatedAt,
            }
          }
        }
        
        // Get chapters separately
        const chapters = await db.chapter.find({ 
          courseId: course._id, 
          isPublished: true 
        }).select('_id')
        
        const enrollment = await db.enrollment.findOne({ userId: user.userId.toString(), courseId: course._id })
        if (!enrollment) {
          const result = { 
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
            category,
            chapters: chapters.map(chapter => ({ _id: chapter._id.toString() })),
            progress: null 
          }
          return result
        }

        const progressDetails = await getProgressDetails(user.userId.toString(), course._id)
        const result = {
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
          category,
          chapters: chapters.map(chapter => ({ _id: chapter._id.toString() })),
          progress: progressDetails.progressPercentage,
          progressDetails: {
            completedVideos: progressDetails.completedVideos,
            totalVideos: progressDetails.totalVideos,
          },
        }
        return result
      }),
    )

    return NextResponse.json(coursesWithProgress)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
