'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Play, CheckCircle, Lock, ArrowLeft, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Video {
  title: string
  youtubeUrl: string
  position: number
}

interface Chapter {
  _id: string
  title: string
  position: number
  isPublished: boolean
  isFree: boolean
  videos: Video[]
}

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

interface EnhancedVideoSidebarProps {
  course: {
    _id: string
    title: string
    chapters: Chapter[]
  }
  courseId: string
  currentChapterId: string
  currentVideoIndex?: number
  onVideoSelect?: (videoIndex: number) => void
}

export const EnhancedVideoSidebar = ({ 
  course, 
  courseId,
  currentChapterId, 
  currentVideoIndex = 0, 
  onVideoSelect 
}: EnhancedVideoSidebarProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set([currentChapterId]))
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Start loading immediately
        setLoading(true)
        const response = await fetch(`/api/courses/${course._id}/video-progress`)
        if (response.ok) {
          const data = await response.json()
          setVideoProgress(data)
        }
      } catch (error) {
        // Failed to fetch video progress
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [course._id])

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const navigateToVideo = (chapterId: string, videoIndex: number) => {
    // If clicking on a video from a different chapter, navigate to that chapter
    if (chapterId !== currentChapterId) {
      router.push(`/courses/${course._id}/chapters/${chapterId}?video=${videoIndex}`)
    } else {
      // If clicking on a video from the current chapter, just change video index
      if (onVideoSelect) {
        onVideoSelect(videoIndex)
      } else {
        router.push(`/courses/${course._id}/chapters/${chapterId}?video=${videoIndex}`)
      }
    }
  }

  const navigateToChapter = (chapterId: string) => {
    router.push(`/courses/${course._id}/chapters/${chapterId}`)
  }

  const getVideoProgress = (chapterId: string, videoIndex: number) => {
    if (!videoProgress) return { isCompleted: false, completedAt: undefined }
    
    const chapterProgress = videoProgress.chapterProgress.find(cp => cp.chapterId === chapterId)
    if (!chapterProgress) return { isCompleted: false, completedAt: undefined }
    
    const video = chapterProgress.videos.find(v => v.videoIndex === videoIndex)
    return video ? { isCompleted: video.isCompleted, completedAt: video.completedAt } : { isCompleted: false, completedAt: undefined }
  }

  // Filter out any null or invalid chapters
  const validChapters = (course?.chapters || []).filter((ch) => ch && ch._id) || []

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0">
      {/* Back to Course Button */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/courses/${courseId}`)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 w-full justify-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </div>

      {/* Course Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{course?.title || 'Course'}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {validChapters.length} sections
        </p>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {loading ? '...' : videoProgress ? `${videoProgress.overallProgress.completedVideos}/${videoProgress.overallProgress.totalVideos}` : '0/0'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: loading ? '0%' : videoProgress ? `${videoProgress.overallProgress.progressPercentage}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {validChapters.length > 0 ? validChapters.map((chapter) => (
            <div key={chapter._id} className="mb-1">
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter._id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition-colors",
                  currentChapterId === chapter._id && "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                )}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {(chapter.videos?.length ?? 0) > 0 ? (
                    expandedChapters.has(chapter._id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {chapter.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(chapter.videos?.length ?? 0)} {(chapter.videos?.length ?? 0) === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {(() => {
                    if (loading) return '...'
                    const chapterProgress = videoProgress?.chapterProgress.find(cp => cp.chapterId === chapter._id)
                    return chapterProgress ? `${chapterProgress.completedVideos}/${chapterProgress.totalVideos}` : '0/0'
                  })()}
                </div>
              </button>

              {/* Videos List */}
              {expandedChapters.has(chapter._id) && (chapter.videos?.length ?? 0) > 0 && (
                <div className="ml-6 space-y-1 mt-1">
                  {chapter.videos?.map((video, videoIndex) => {
                    if (!video) return null
                    const isCurrentVideo = currentChapterId === chapter._id && currentVideoIndex === videoIndex
                    const videoProgressData = getVideoProgress(chapter._id, videoIndex)

                    return (
                      <button
                        key={videoIndex}
                        onClick={() => navigateToVideo(chapter._id, videoIndex)}
                        className={cn(
                          "w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors text-xs",
                          isCurrentVideo
                            ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100"
                            : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {videoProgressData.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {video?.title || 'Untitled Video'}
                          </p>
                          {videoProgressData.completedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Completed {new Date(videoProgressData.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {isCurrentVideo && (
                          <Play className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No chapters available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
