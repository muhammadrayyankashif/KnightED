import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TeacherVideoPlayerWrapper } from './components/teacher-video-player-wrapper'

const TeacherChapterViewPage = async ({ params }: { params: Promise<{ courseId: string, chapterId: string }> }) => {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return redirect('/')
    }

    // Check if user is the teacher of this course
    const course = await db.course.findById(resolvedParams.courseId)
    if (!course || course.createdById !== user.userId.toString()) {
      return redirect('/teacher/courses')
    }

    // Get chapter data
    const chapter = await db.chapter.findById(resolvedParams.chapterId)
    if (!chapter || chapter.courseId !== resolvedParams.courseId) {
      return redirect(`/teacher/courses/${resolvedParams.courseId}/view`)
    }

    // Get all chapters for the course
    const chapters = await db.chapter.find({
      courseId: resolvedParams.courseId,
      isPublished: true
    }).sort({ position: 1 })

    // Find next chapter
    const currentIndex = chapters.findIndex(ch => ch._id.toString() === resolvedParams.chapterId)
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

    // Create course object with chapters for sidebar
    const courseWithChapters = {
      _id: course._id.toString(),
      title: course.title,
      chapters: chapters.map(chapter => ({
        _id: chapter._id.toString(),
        title: chapter.title,
        position: chapter.position,
        isPublished: chapter.isPublished,
        isFree: chapter.isFree,
        videos: chapter.videos ? chapter.videos.map((video: any) => ({
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          position: video.position,
        })) : [],
      }))
    }

    // Serialize chapter data
    const serializedChapter = {
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
    }

    return (
      <div className="h-screen flex flex-col lg:flex-row bg-slate-950 lg:min-h-full min-h-0 overflow-hidden">
        <TeacherVideoPlayerWrapper
          course={courseWithChapters}
          chapter={serializedChapter}
          courseId={resolvedParams.courseId}
          chapterId={resolvedParams.chapterId}
          nextChapterId={nextChapter?._id.toString()}
          isLocked={false}
          completedOnEnd={false}
        />
      </div>
    )
  } catch (error) {
    return redirect('/teacher/courses')
  }
}

export default TeacherChapterViewPage