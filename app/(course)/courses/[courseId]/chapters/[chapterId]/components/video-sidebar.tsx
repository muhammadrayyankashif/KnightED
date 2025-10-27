'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react'
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

interface VideoSidebarProps {
  course: {
    _id: string
    title: string
    chapters: Chapter[]
  }
  currentChapterId: string
  currentVideoIndex?: number
  onVideoSelect?: (videoIndex: number) => void
}

export const VideoSidebar = ({ course, currentChapterId, currentVideoIndex = 0, onVideoSelect }: VideoSidebarProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set([currentChapterId]))
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <div className="w-80 bg-background dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Back to Course Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/courses/${course._id}`)}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </div>

      {/* Course Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-foreground truncate">{course.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {course.chapters?.length || 0} sections
        </p>
      </div>

      {/* Course Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {course.chapters?.length > 0 ? course.chapters.map((chapter) => (
            <div key={chapter._id} className="mb-1">
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter._id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 text-left hover:bg-muted dark:hover:bg-slate-800 rounded-md transition-colors",
                  currentChapterId === chapter._id && "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                )}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {chapter.videos.length > 0 ? (
                    expandedChapters.has(chapter._id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                  )}

                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {chapter.isFree ? (
                      <Play className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {chapter.title}
                    </span>
                  </div>
                </div>

                {chapter.videos.length > 0 && (
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {chapter.videos.length}
                  </span>
                )}
              </button>

              {/* Videos List */}
              {chapter.videos.length > 0 && expandedChapters.has(chapter._id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {chapter.videos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToVideo(chapter._id, index)}
                      className={cn(
                        "w-full flex items-center space-x-3 p-2 text-left hover:bg-muted dark:hover:bg-slate-800 rounded-md transition-colors",
                        currentChapterId === chapter._id && currentVideoIndex === index && "bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                      )}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Play className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground truncate">
                          {video.title}
                        </span>
                      </div>

                      {/* Video duration placeholder - you can add actual duration later */}
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        5:30
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No chapters available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
