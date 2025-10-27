'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Play, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'
import { useConfettiStore } from '@/hooks/use-confetti'

// YouTube API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface Video {
  title: string
  youtubeUrl: string
  position: number
}

interface UdemyVideoPlayerProps {
  videoUrl: string
  videos: Video[]
  courseId: string
  chapterId: string
  nextChapterId?: string
  isLocked: boolean
  completeOnEnd: boolean
  title: string
  currentVideoIndex: number
}

export const UdemyVideoPlayer = ({
  videoUrl,
  videos,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  currentVideoIndex,
}: UdemyVideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const router = useRouter()
  const confetti = useConfettiStore()
  const playerRef = useRef<any>(null)

  // Get current video URL
  const currentVideo = (videos && videos.length > 0 && currentVideoIndex < videos.length) ? videos[currentVideoIndex] : null
  const currentVideoUrl = currentVideo?.youtubeUrl || videoUrl

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeVideoId(currentVideoUrl)

  const markVideoComplete = useCallback(async () => {
    try {
      // Mark video as completed when user visits the video page
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/videos/${currentVideoIndex}/progress`, {
        isCompleted: true,
      })
      router.refresh()
    } catch (error) {
      // Silently fail - don't show error for progress tracking
    }
  }, [courseId, chapterId, currentVideoIndex, router])

  // Mark video as complete when component mounts (user visits the video page)
  useEffect(() => {
    markVideoComplete()
  }, [markVideoComplete])

  const handleVideoEnd = useCallback(async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        })

        if (!nextChapterId) {
          confetti.onOpen()
        }

        toast.success('Progress updated')
        router.refresh()

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
        }
      }
    } catch {
      toast.error('Something went wrong')
    }
  }, [completeOnEnd, courseId, chapterId, nextChapterId, confetti, router])

  useEffect(() => {
    // Load YouTube API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
      } else {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        script.onload = () => {
          // Small delay to ensure YT object is fully initialized
          setTimeout(initializePlayer, 100)
        }
        document.body.appendChild(script)

        window.onYouTubeIframeAPIReady = () => {
          // Delay to ensure proper initialization
          setTimeout(initializePlayer, 100)
        }
      }
    }

    const initializePlayer = () => {
      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy()
          } catch (e) {
            // Ignore destroy errors
          }
        }

        if (!window.YT || !window.YT.Player) {
          return
        }

        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
          },
          events: {
            onReady: (event: any) => {
              setIsReady(true)
              setIsPlaying(false)
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                handleVideoEnd()
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              }
            },
            onError: (event: any) => {
              // Handle YouTube player errors silently
              if (event.data === 150) {
                // Same as 2 - video not allowed to be played embedded
                setIsReady(true)
              }
            },
          },
        })
      } catch (error) {
        // Silently handle initialization errors
        setIsReady(true)
      }
    }

    if (videoId) {
      loadYouTubeAPI()
    } else {
      setIsReady(true)
    }

    return () => {
      try {
        if (playerRef.current) {
          playerRef.current.destroy()
        }
      } catch (e) {
        // Ignore destroy errors
      }
    }
  }, [videoId, handleVideoEnd, markVideoComplete])

  const playVideo = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo()
    }
  }

  const pauseVideo = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo()
    }
  }

  const toggleFullscreen = () => {
    const playerElement = document.getElementById('youtube-player')
    if (playerElement) {
      if (!document.fullscreenElement) {
        playerElement.parentElement?.requestFullscreen().catch(() => {
          // Silently handle fullscreen error
        })
      } else {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div className="relative w-full h-full min-h-[250px] sm:min-h-[400px] bg-black">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-black text-white">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {!isLocked && videoId && (
        <div className="relative w-full h-full">
          <div id="youtube-player" className="w-full h-full" />

          {/* Play/Pause Overlay */}
          {!isPlaying && isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <Button
                onClick={playVideo}
                size="lg"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20 rounded-full w-16 h-16 flex items-center justify-center flex-col"
                title="Resume video"
              >
                <Play className="h-6 w-6 ml-1" />
              </Button>
              <Button
                onClick={toggleFullscreen}
                size="lg"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20 rounded-full w-16 h-16 flex items-center justify-center flex-col"
                title="Fullscreen"
              >
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLocked && !videoId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <p className="text-lg mb-2">No video available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          </div>
        </div>
      )}
    </div>
  )
}
