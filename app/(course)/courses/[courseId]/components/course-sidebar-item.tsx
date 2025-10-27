'use client'

import { CheckCircleIcon, LockIcon, PlayCircleIcon, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type CourseSidebarItemProps = {
  id: string
  label: string
  isCompleted: boolean
  courseId: string
  isLocked: boolean
  chapter?: any
}

export default function CourseSidebarItem({ id, label, isCompleted, courseId, isLocked, chapter }: CourseSidebarItemProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = isLocked ? LockIcon : isCompleted ? CheckCircleIcon : PlayCircleIcon

  const isActive = pathname?.includes(id)

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`)
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const hasVideos = chapter?.videos && chapter.videos.length > 0

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        type="button"
        className={cn(
          'flex items-center gap-x-2 w-full text-sm font-medium text-slate-500 dark:text-gray-400 transition-all hover:bg-slate-300/20 dark:hover:bg-slate-700/30 hover:text-slate-600 dark:hover:text-gray-300',
          {
            'bg-slate-200/20 dark:bg-slate-700/30 text-slate-700 dark:text-gray-200 hover:bg-slate-200/20 dark:hover:bg-slate-700/30 hover:text-slate-700 dark:hover:text-gray-200': isActive,
            'text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300': isCompleted,
            'bg-emerald-200/20 dark:bg-emerald-900/20': isCompleted && isActive,
          },
        )}
      >
        <div className="flex items-center gap-x-2 py-3 px-4 w-full">
          {hasVideos && (
            <button
              onClick={toggleExpanded}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <Icon
            size={18}
            className={cn('text-slate-500 flex-shrink-0', { 
              'text-slate-700': isActive, 
              'text-emerald-700': isCompleted 
            })}
          />
          <span className="text-left flex-1 truncate">{label}</span>
          {hasVideos && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {chapter.videos.length} videos
            </span>
          )}
        </div>

        <div
          className={cn('h-full border-2 border-slate-700 opacity-0 transition-all', {
            'opacity-100': isActive,
            'border-emerald-700': isCompleted,
          })}
        />
      </button>

      {/* Video List */}
      {hasVideos && isExpanded && (
        <div className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
          {chapter.videos.map((video: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-x-2 py-2 px-8 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Play className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{video.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
