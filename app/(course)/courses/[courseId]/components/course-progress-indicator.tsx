'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'

interface CourseProgressData {
  courseId: string
  userId: string
  overallProgress: {
    totalVideos: number
    completedVideos: number
    progressPercentage: number
  }
  chapterProgress: Array<{
    chapterId: string
    chapterTitle: string
    totalVideos: number
    completedVideos: number
    progressPercentage: number
  }>
}

interface CourseProgressIndicatorProps {
  courseId: string
}

export function CourseProgressIndicator({ courseId }: CourseProgressIndicatorProps) {
  const [progress, setProgress] = useState<CourseProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/video-progress`)
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        // Failed to fetch video progress
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [courseId])

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  if (!progress) {
    return null
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Your Progress</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {progress.overallProgress.completedVideos} / {progress.overallProgress.totalVideos} videos
        </span>
      </div>

      <div className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progress.overallProgress.progressPercentage)}%</span>
          </div>
          <Progress
            value={progress.overallProgress.progressPercentage}
            className="h-2"
          />
        </div>

        {/* Chapter Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">Chapter Progress</h4>
          {progress.chapterProgress.map((chapter) => (
            <div key={chapter.chapterId} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span className="truncate">{chapter.chapterTitle}</span>
                <span>{chapter.completedVideos}/{chapter.totalVideos}</span>
              </div>
              <Progress
                value={chapter.progressPercentage}
                className="h-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
