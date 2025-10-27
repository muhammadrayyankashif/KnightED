import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import CourseSidebarItem from './course-sidebar-item'
import { CourseProgress } from '@/components/course-progress'
import { ChevronDown, ChevronRight, Play, Clock } from 'lucide-react'
import { useState } from 'react'

type CourseSidebarProps = {
  course: any // Course with chapters and userProgress
  progressCount: number
}

export default async function CourseSidebar({ course, progressCount }: CourseSidebarProps) {
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/')
  }

  const enrollment = await db.enrollment.findOne({
    userId: user.userId,
    courseId: course._id,
  })

  // Calculate total videos and estimated duration
  const totalVideos = course.chapters.reduce((acc: number, chapter: any) => 
    acc + (chapter.videos?.length || 0) + (chapter.videoUrl ? 1 : 0), 0
  )
  const estimatedDuration = totalVideos * 10 // Assume 10 minutes per video

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-gray-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      {/* Course Header */}
      <div className="flex flex-col border-b border-gray-200 dark:border-slate-800 p-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{course.title}</h1>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
          <div className="flex items-center">
            <Play className="h-4 w-4 mr-1" />
            {totalVideos} videos
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {estimatedDuration} min
          </div>
        </div>
        {enrollment ? (
          <div className="mt-4">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        ) : null}
      </div>

      {/* Course Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">Course Content</h2>
          <div className="space-y-1">
            {course.chapters.map((chapter: any, index: number) => (
              <div key={chapter._id} className="border rounded-lg">
                <CourseSidebarItem
                  id={chapter._id}
                  label={`Chapter ${index + 1}: ${chapter.title}`}
                  isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                  courseId={course._id}
                  isLocked={!chapter.isFree && !enrollment}
                  chapter={chapter}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
