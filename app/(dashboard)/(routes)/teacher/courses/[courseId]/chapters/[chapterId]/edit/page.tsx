import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChapterTitleForm } from '../components/chapter-title-form'
import { ChapterVideosForm } from '../components/chapter-videos-form'
import { ChapterActions } from '../components/chapter-actions'

const TeacherChapterEditPage = async ({ params }: { params: Promise<{ courseId: string, chapterId: string }> }) => {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return redirect('/')
    }

    const course = await db.course.findById(resolvedParams.courseId)
    if (!course || course.createdById !== user.userId.toString()) {
      return redirect('/teacher/courses')
    }

    const chapter = await db.chapter.findById(resolvedParams.chapterId)
    if (!chapter || chapter.courseId !== resolvedParams.courseId) {
      return redirect(`/teacher/courses/${resolvedParams.courseId}`)
    }

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
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/teacher/courses/${resolvedParams.courseId}`}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Edit Chapter
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <ChapterActions
              disabled={false}
              courseId={resolvedParams.courseId}
              chapterId={resolvedParams.chapterId}
              isPublished={serializedChapter.isPublished}
            />
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground">
            Edit Chapter: {serializedChapter.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your chapter title and upload multiple videos
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Chapter Title */}
          <div className="bg-background dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chapter Title</h2>
            </div>
            <ChapterTitleForm
              initialData={serializedChapter}
              courseId={resolvedParams.courseId}
              chapterId={resolvedParams.chapterId}
            />
          </div>

          {/* Chapter Videos (Multiple) */}
          <div className="bg-background dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chapter Videos</h2>
            </div>
            <ChapterVideosForm
              initialData={serializedChapter}
              courseId={resolvedParams.courseId}
              chapterId={resolvedParams.chapterId}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return redirect('/teacher/courses')
  }
}

export default TeacherChapterEditPage
