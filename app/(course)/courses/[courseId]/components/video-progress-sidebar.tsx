'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoProgress {
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
    videos: Array<{
      videoIndex: number
      videoTitle: string
      isCompleted: boolean
      completedAt?: string
    }>
  }>
}

interface VideoProgressSidebarProps {
  courseId: string
  currentChapterId?: string
  currentVideoIndex?: number
  onVideoSelect?: (chapterId: string, videoIndex: number) => void
}

export function VideoProgressSidebar({ 
  courseId, 
  currentChapterId, 
  currentVideoIndex,
  onVideoSelect 
}: VideoProgressSidebarProps) {
  const [progress, setProgress] = useState<VideoProgress | null>(null)
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
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <p className="text-gray-500">Failed to load progress</p>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Progress Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Course Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Videos Completed</span>
            <span>{progress.overallProgress.completedVideos} / {progress.overallProgress.totalVideos}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.overallProgress.progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {Math.round(progress.overallProgress.progressPercentage)}% Complete
          </div>
        </div>
      </div>

      {/* Chapter Progress */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {progress.chapterProgress.map((chapter) => (
            <div key={chapter.chapterId} className="mb-4">
              {/* Chapter Header */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {chapter.chapterTitle}
                </h4>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{chapter.completedVideos} / {chapter.totalVideos} videos</span>
                  <span>{Math.round(chapter.progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${chapter.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Videos List */}
              <div className="space-y-1">
                {chapter.videos.map((video) => {
                  const isCurrentVideo = currentChapterId === chapter.chapterId && currentVideoIndex === video.videoIndex
                  
                  return (
                    <button
                      key={video.videoIndex}
                      onClick={() => onVideoSelect?.(chapter.chapterId, video.videoIndex)}
                      className={cn(
                        "w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors text-xs",
                        isCurrentVideo 
                          ? "bg-blue-50 border border-blue-200 text-blue-900" 
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {video.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">
                          {video.videoTitle}
                        </p>
                        {video.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed {new Date(video.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isCurrentVideo && (
                        <Play className="h-3 w-3 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
