// Removed Prisma import - using MongoDB now
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getProgress } from './get-progress'

type CourseWithProgressAndCategory = any & {
  progress: number
}

type DashboardCourses = {
  completedCourses: CourseWithProgressAndCategory[]
  coursesInProgress: CourseWithProgressAndCategory[]
}

export async function getDashboardCourses(userId: string): Promise<DashboardCourses> {
  try {
    await connectDB()
    const enrollments = await db.enrollment.find({ userId: userId.toString() })
    
    // Get course details for each enrollment
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await db.course.findById(enrollment.courseId)
        if (!course) return null
        
        // Get category details
        let category = null
        if (course.categoryId) {
          const categoryDoc = await db.category.findById(course.categoryId)
          if (categoryDoc) {
            category = {
              _id: categoryDoc._id.toString(),
              name: categoryDoc.name,
            }
          }
        }
        
        const progress = await getProgress(userId, course._id)
        
        return {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          isPublished: course.isPublished,
          createdById: course.createdById,
          categoryId: course.categoryId,
          categoryIds: course.categoryIds,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          category,
          progress,
        } as CourseWithProgressAndCategory
      })
    )
    
    // Filter out null courses
    const validCourses = courses.filter(Boolean) as CourseWithProgressAndCategory[]

    const completedCourses = validCourses.filter((course) => course.progress === 100)
    const coursesInProgress = validCourses.filter((course) => (course?.progress ?? 0) < 100)

    return {
      completedCourses,
      coursesInProgress,
    }
  } catch {
    return {
      completedCourses: [],
      coursesInProgress: [],
    }
  }
}
