'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Menu, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UdemyVideoPlayer } from './udemy-video-player'
import { EnhancedVideoSidebar } from './enhanced-video-sidebar'
import { VideoNoteSystem } from './video-note-system'
import { VideoCommentSystem } from './video-comment-system'

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
  videoUrl?: string
  videos: Video[]
}

interface Course {
  _id: string
  title: string
  chapters: Chapter[]
}

interface VideoPlayerWrapperProps {
  course: Course
  chapter: Chapter
  courseId: string
  chapterId: string
  nextChapterId?: string
  isLocked: boolean
  completedOnEnd: boolean
}

export const VideoPlayerWrapper = ({
  course,
  chapter,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completedOnEnd,
}: VideoPlayerWrapperProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'notes' | 'comments'>('comments')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Get video index from URL params
  useEffect(() => {
    const videoParam = searchParams.get('video')
    if (videoParam) {
      const videoIndex = parseInt(videoParam)
      if (!isNaN(videoIndex) && videoIndex >= 0) {
        setCurrentVideoIndex(videoIndex)
      }
    } else {
      // Reset to first video if no video parameter
      setCurrentVideoIndex(0)
    }
  }, [searchParams, chapterId]) // Add chapterId dependency to reset when chapter changes

  // Update URL when video index changes
  const updateVideoIndex = (newIndex: number) => {
    setCurrentVideoIndex(newIndex)
    const url = new URL(window.location.href)
    url.searchParams.set('video', newIndex.toString())
    router.push(url.pathname + url.search, { scroll: false })
  }

  // Ensure required data exists
  if (!course || !chapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-slate-950 lg:min-h-full min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">{course.title}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="dark:text-gray-300 dark:hover:bg-slate-800"
        >
          {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 transform bg-white dark:bg-slate-900 shadow-lg transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Course Content</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="dark:text-gray-300 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        <EnhancedVideoSidebar
          course={course}
          courseId={courseId}
          currentChapterId={chapterId}
          currentVideoIndex={currentVideoIndex}
          onVideoSelect={(index) => {
            updateVideoIndex(index)
            setIsMobileSidebarOpen(false)
          }}
        />
        </div>
      </div>

      {/* Desktop Video Sidebar */}
      <div className="hidden lg:flex lg:flex-col">
        <EnhancedVideoSidebar
          course={course}
          courseId={courseId}
          currentChapterId={chapterId}
          currentVideoIndex={currentVideoIndex}
          onVideoSelect={updateVideoIndex}
        />
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-y-auto">
        {/* Video Player */}
        <div className="bg-black w-full aspect-video">
          <UdemyVideoPlayer
            chapterId={chapter._id}
            title={chapter.title}
            courseId={courseId}
            nextChapterId={nextChapterId}
            videoUrl={chapter.videoUrl || ''}
            videos={chapter.videos || []}
            isLocked={isLocked}
            completeOnEnd={completedOnEnd}
            currentVideoIndex={currentVideoIndex}
          />
        </div>

        {/* Notes/Comments Section */}
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Notes
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-3 lg:p-4 flex-shrink-0">
              {activeTab === 'comments' ? (
                <VideoCommentSystem
                  chapterId={chapterId}
                  courseId={courseId}
                  videoIndex={currentVideoIndex}
                />
              ) : (
                <VideoNoteSystem
                  chapterId={chapterId}
                  courseId={courseId}
                  videoIndex={currentVideoIndex}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
