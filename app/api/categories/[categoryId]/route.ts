import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(request)

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { categoryId } = await params

    // Check if category is being used by any courses
    const coursesUsingCategory = await db.course.countDocuments({ categoryId })
    if (coursesUsingCategory > 0) {
      return new NextResponse(
        `Cannot delete category. It is being used by ${coursesUsingCategory} course(s)`,
        { status: 400 }
      )
    }

    const deletedCategory = await db.category.findByIdAndDelete(categoryId)

    if (!deletedCategory) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
