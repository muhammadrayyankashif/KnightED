import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import CourseNavbar from './components/course-navbar'
import CourseSidebar from './components/course-sidebar'
import { getProgress } from '@/actions/get-progress'

type CourseLayoutProps = {
  children: React.ReactNode
  params: Promise<{ courseId: string }>
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  try {
    await connectDB()
    const user = await getCurrentUser()
    if (!user) {
      return redirect('/')
    }
    const resolvedParams = await params

    const course = await db.course.findById(resolvedParams.courseId)

  if (!course) {
    // Redirect to search page instead of home to avoid redirect chain
    return redirect('/student/search')
  }
  
  // Get chapters separately
  const chapters = await db.chapter.find({
    courseId: resolvedParams.courseId,
    isPublished: true
  }).sort({ position: 1 })
  
  // Convert MongoDB objects to plain objects to avoid serialization warnings
  const serializedChapters = chapters.map(chapter => ({
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
    videos: chapter.videos ? chapter.videos.map((video: any) => ({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      position: video.position,
    })) : [],
  }))
  
  // Create a clean course object to avoid circular references
  const courseWithChapters = {
    _id: course._id.toString(),
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    isPublished: course.isPublished,
    createdById: course.createdById.toString(),
    categoryId: course.categoryId?.toString(),
    categoryIds: course.categoryIds?.map((id: any) => id.toString()) || [],
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    chapters: serializedChapters
  }

  const progressCount = await getProgress(user.userId, course._id)

    return (
      <div className="h-full">
        <main className="h-full">{children}</main>
      </div>
    )
  } catch (error) {
    return redirect('/')
  }
}
