// Removed Prisma import - using MongoDB now
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getProgress, getProgressDetails } from './get-progress'

export type CourseWithProgressAndCategory = any & {
  category: any | null
  chapters: { _id: string }[]
  progress: number | null
  progressDetails?: {
    completedVideos: number
    totalVideos: number
  } | null
}

type GetCoursesArgs = {
  userId: string
  title?: string
  categoryId?: string
}

export async function getCourses({
  userId,
  title,
  categoryId,
}: GetCoursesArgs): Promise<CourseWithProgressAndCategory[]> {
  try {
    await connectDB()
    const query: any = { isPublished: true }
    if (title) query.title = { $regex: title, $options: 'i' }
    if (categoryId) {
      // Support both single categoryId and multiple categoryIds
      query.$or = [
        { categoryId: categoryId },
        { categoryIds: categoryId }
      ]
    }

    const courses = await db.course.find(query).sort({ createdAt: -1 })

    const coursesWithProgress: CourseWithProgressAndCategory[] = await Promise.all(
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
        
        const enrollment = await db.enrollment.findOne({ userId: userId.toString(), courseId: course._id })
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

        const progressDetails = await getProgressDetails(userId, course._id)
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

    return coursesWithProgress
  } catch {
    return []
  }
}
