import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'
import { ArrowLeft, Play, Users, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Preview } from '@/components/preview'
import { ResourceButton } from '@/app/(course)/courses/[courseId]/components/resource-button'
import { TeacherCourseCommentSystem } from './components/teacher-course-comment-system'

const TeacherCourseViewPage = async ({ params }: { params: Promise<{ courseId: string }> }) => {
  try {
    await connectDB()
    const { courseId } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return redirect('/')
    }

    // Check if user is the teacher of this course
    const course = await db.course.findById(courseId)
    if (!course || course.createdById !== user.userId.toString()) {
      return redirect('/teacher/courses')
    }

    // Get chapters and attachments
    const chapters = await db.chapter.find({
      courseId,
      isPublished: true
    }).sort({ position: 1 })

    const attachments = await db.attachment.find({ courseId })

    // Get the first published chapter for the watch button
    const firstChapter = chapters[0]

    // Serialize data
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

    const serializedAttachments = attachments.map(attachment => ({
      _id: attachment._id.toString(),
      name: attachment.name,
      url: attachment.url,
      courseId: attachment.courseId.toString(),
      fileExtension: attachment.fileExtension || '',
      resourceType: attachment.resourceType || 'file',
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    }))

    return (
      <div className="min-h-screen bg-background dark:bg-slate-950">
        {/* Header */}
        <div className="bg-background dark:bg-slate-900 border-b dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/teacher/courses"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to my courses
              </Link>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Teacher View
                </Badge>
                <Link href={`/teacher/courses/${courseId}`}>
                  <Button variant="outline" size="sm">
                    Edit Course
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <div className="bg-background dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 p-6">
                <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4">
                  <div className="flex-shrink-0 w-full lg:w-auto">
                    <Image
                      src={course.imageUrl || '/placeholder-course.jpg'}
                      alt={course.title}
                      width={200}
                      height={120}
                      className="rounded-lg object-cover w-full lg:w-auto"
                    />
                  </div>
                  <div className="flex-1 w-full flex flex-col">
                    <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {serializedChapters.length} chapters
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {serializedAttachments.length} resources
                      </div>
                    </div>
                    <div className="text-foreground flex-grow">
                      <Preview value={course.description || ''} />
                    </div>
                    {firstChapter && (
                      <Link href={`/teacher/courses/${courseId}/chapters/${firstChapter._id}`} className="lg:hidden w-full mt--8">
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-background dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800">
                <div className="p-6 border-b dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-foreground">Course Content</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {serializedChapters.map((chapter, index) => (
                      <div key={chapter._id} className="border dark:border-slate-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-foreground">
                            Chapter {index + 1}: {chapter.title}
                          </h3>
                          <Badge variant="secondary">
                            {chapter.videos?.length || 0} videos
                          </Badge>
                        </div>
                        {chapter.description && (
                          <div className="text-sm text-muted-foreground">
                            <Preview value={chapter.description} />
                          </div>
                        )}
                        {chapter.videos && chapter.videos.length > 0 && (
                          <div className="space-y-2">
                            {chapter.videos.map((video: any, videoIndex: number) => (
                              <div key={videoIndex} className="flex items-center text-sm text-muted-foreground">
                                <Play className="h-3 w-3 mr-2" />
                                {video.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resources */}
              {serializedAttachments.length > 0 && (
                <div className="bg-background dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800">
                  <div className="p-6 border-b dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-foreground">Resources</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {serializedAttachments.map((attachment) => (
                        <div key={attachment._id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                            <span className="text-sm font-medium text-foreground">{attachment.name}</span>
                          </div>
                          <ResourceButton
                            courseId={courseId}
                            attachmentId={attachment._id}
                            filename={attachment.name.includes('.') ? attachment.name : `${attachment.name}.${attachment.fileExtension}`}
                            url={attachment.url}
                            fileExtension={attachment.fileExtension}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Course Comments */}
              <div className="bg-background dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800">
                <div className="p-6">
                  <TeacherCourseCommentSystem courseId={courseId} />
                </div>
              </div>
            </div>

            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="sticky top-24 bg-background dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <Image
                        src={course.imageUrl || '/placeholder-course.jpg'}
                        alt={course.title}
                        width={300}
                        height={180}
                        className="rounded-lg object-cover mx-auto"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{course.title}</h3>
                    <div className="text-sm text-muted-foreground mb-4">
                      {serializedChapters.length} chapters
                    </div>
                    {firstChapter && (
                      <Link href={`/teacher/courses/${courseId}/chapters/${firstChapter._id}`}>
                        <Button className="w-full" size="lg">
                          <Play className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return redirect('/teacher/courses')
  }
}

export default TeacherCourseViewPage
