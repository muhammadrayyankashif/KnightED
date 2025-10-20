import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { DataTable } from './_component/data-table'
import { columns } from './_component/columns'

export default async function Courses() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/')
  }

  const courses = await db.course.find({ createdById: user.userId.toString() }).sort({ createdAt: -1 })

  // Convert Mongoose documents to plain objects
  const serializedCourses = courses.map(course => ({
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
  }))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Manage and create your courses
        </p>
      </div>
      <DataTable columns={columns} data={serializedCourses} />
    </div>
  )
}
