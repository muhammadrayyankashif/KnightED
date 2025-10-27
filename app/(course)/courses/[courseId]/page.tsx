import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/teacher'
import { ArrowLeft, Play, Users, FileText, Star, StarOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Preview } from '@/components/preview'
import { ResourceButton } from './components/resource-button'
import { CourseCommentSystem } from './components/course-comment-system'
import { EnrollmentButton } from './components/enrollment-button'
import { BookmarkButton } from './components/bookmark-button'
import { FeaturedButton } from './components/featured-button'
import { CourseProgressIndicator } from './components/course-progress-indicator'

const CourseIdPage = async ({ params }: { params: Promise<{ courseId: string }> }) => {
  try {
    await connectDB()
    const { courseId } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return redirect('/')
    }

  const course = await db.course.findById(courseId)

  if (!course) {
    // Redirect to search page instead of home to avoid redirect chain
    return redirect('/student/search')
  }

  // Get chapters and attachments
  const chapters = await db.chapter.find({
    courseId,
    isPublished: true
  }).sort({ position: 1 })

  const attachments = await db.attachment.find({ courseId })

  // Check if user is enrolled in this course
  const enrollment = await db.enrollment.findOne({
    userId: user.userId.toString(),
    courseId,
  })

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/student/search"
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Course Header */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 sm:p-6">
              {/* Image and Details */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Image
                    src={course.imageUrl || '/placeholder-course.jpg'}
                    alt={course.title}
                    width={200}
                    height={120}
                    className="rounded-lg object-cover w-full sm:w-[200px]"
                  />
                </div>
                <div className="flex-1 w-full">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{course.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {serializedChapters.length} chapters
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {serializedAttachments.length} resources
                    </div>
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-3">
                    <Preview value={course.description || ''} />
                  </div>
                </div>
              </div>

              {/* Full Width Buttons */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 flex flex-col gap-3 sm:flex-row">
                <BookmarkButton courseId={courseId} />
                {isAdmin(user) && (
                  <FeaturedButton
                    courseId={courseId}
                    isFeatured={course.isFeatured === true}
                  />
                )}
                {firstChapter && (
                  <EnrollmentButton
                    courseId={courseId}
                    firstChapterId={firstChapter._id}
                    isEnrolled={!!enrollment}
                  />
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            {enrollment && (
              <CourseProgressIndicator courseId={courseId} />
            )}

            {/* Course Content */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">Course Content</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {serializedChapters.map((chapter, index) => (
                    <div key={chapter._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 dark:bg-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
                          Chapter {index + 1}: {chapter.title}
                        </h3>
                        <Badge variant="secondary" className="dark:bg-slate-700 dark:text-gray-200 w-fit">
                          {chapter.videos?.length || 0} videos
                        </Badge>
                      </div>
                      {chapter.description && (
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Preview value={chapter.description} />
                        </div>
                      )}
                      {chapter.videos && chapter.videos.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {chapter.videos.map((video: any, videoIndex: number) => (
                            <div key={videoIndex} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <Play className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{video.title}</span>
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
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">Resources</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {serializedAttachments.map((attachment) => (
                      <div key={attachment._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 gap-3 sm:gap-0">
                        <div className="flex items-center min-w-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{attachment.name}</span>
                        </div>
                        <div className="flex-shrink-0">
                          <ResourceButton
                            courseId={courseId}
                            attachmentId={attachment._id}
                            filename={attachment.name.includes('.') ? attachment.name : `${attachment.name}.${attachment.fileExtension}`}
                            url={attachment.url}
                            fileExtension={attachment.fileExtension}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Course Comments */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
              <div className="p-4 sm:p-6">
                <CourseCommentSystem courseId={courseId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    return redirect('/')
  }
}

export default CourseIdPage
