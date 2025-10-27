import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Banner } from '@/components/banner'
import { VideoPlayerWrapper } from './components/video-player-wrapper'
import { getChapter } from '@/actions/get-chapter'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type Params = Promise<{
  courseId: string
  chapterId: string
}>

type ChapterDetailsProps = {
  params: Params
}

export default async function ChapterDetails({ params }: ChapterDetailsProps) {
  try {
    const resolvedParams = await params
    const user = await getCurrentUser()
    if (!user) {
      return redirect('/')
    }

    await connectDB()

  // Auto-enroll user if not already enrolled (since all courses are free)
  const existingEnrollment = await db.enrollment.findOne({
    userId: (user as any).userId.toString(),
    courseId: resolvedParams.courseId,
  })

  if (!existingEnrollment) {
    await db.enrollment.create({
      userId: (user as any).userId.toString(),
      courseId: resolvedParams.courseId,
    })
  }

  const { chapter, course, attachments, nextChapter, userProgress, enrollment } = await getChapter({
    userId: (user as any).userId.toString(),
    ...resolvedParams,
  })

  if (!chapter || !course) {
    return redirect('/')
  }

  // Fetch all chapters for the sidebar
  const allChapters = await db.chapter.find({
    courseId: resolvedParams.courseId,
    isPublished: true
  }).sort({ position: 1 })

  // Create course object with chapters for sidebar
  const courseWithChapters = {
    _id: course._id,
    title: course.title,
    chapters: allChapters.filter((chapter) => chapter && chapter._id).map(chapter => ({
      _id: chapter._id?.toString() || '',
      title: chapter.title || 'Untitled Chapter',
      position: chapter.position || 0,
      isPublished: chapter.isPublished || false,
      isFree: chapter.isFree || false,
      videos: chapter.videos ? chapter.videos.filter((v: any) => v).map((video: any) => ({
        title: video?.title || 'Untitled Video',
        youtubeUrl: video?.youtubeUrl || '',
        position: video?.position || 0,
      })) : [],
    }))
  }

  const isLocked = false // All courses are free now, so nothing is locked
  const completedOnEnd = !userProgress?.isCompleted

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {userProgress?.isCompleted ? <Banner label="You already completed this chapter" variant="success" /> : null}
      {isLocked ? <Banner label="You need to enroll in this course to watch this chapter" /> : null}

      <VideoPlayerWrapper
        course={courseWithChapters}
        chapter={chapter}
        courseId={resolvedParams.courseId}
        chapterId={resolvedParams.chapterId}
        nextChapterId={nextChapter?._id}
        isLocked={isLocked}
        completedOnEnd={completedOnEnd}
      />
    </div>
  )
  } catch (error) {
    return redirect('/')
  }
}
