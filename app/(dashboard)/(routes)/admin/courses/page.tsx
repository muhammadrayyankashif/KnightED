import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { AdminCoursesTable } from './components/admin-courses-table'

export default async function AdminCoursesPage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user || !isAdmin(user)) {
    return redirect('/')
  }

  // Get all courses
  const courses = await db.course.find().sort({ createdAt: -1 })


  // Get creator details for each course
  const serializedCourses = await Promise.all(
    courses.map(async (course) => {
      const creator = await db.user.findById(course.createdById)
      
      return {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        isPublished: course.isPublished,
        isFeatured: course.isFeatured === true, // Only true if explicitly set to true
        createdById: creator ? {
          _id: creator._id.toString(),
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
        } : null,
        categoryId: course.categoryId,
        categoryIds: course.categoryIds,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      }
    })
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="text-muted-foreground">
          Manage all courses in KnightED
        </p>
      </div>
      
      <AdminCoursesTable courses={serializedCourses} />
    </div>
  )
}
