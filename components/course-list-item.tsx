import Image from 'next/image'
import Link from 'next/link'
import { BookOpenIcon, ClockIcon, PlayIcon } from 'lucide-react'
import { IconBadge } from './icon-badge'
import { Progress } from '@/components/ui/progress'

type CourseListItemProps = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  chaptersLength: number
  progress: number | null
  category: string
  progressDetails?: {
    completedVideos: number
    totalVideos: number
  } | null
}

export default function CourseListItem({
  id,
  title,
  description,
  imageUrl,
  chaptersLength,
  progress,
  category,
  progressDetails,
}: CourseListItemProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-gray-300 dark:hover:border-slate-600">
        {/* Course Thumbnail */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 overflow-hidden rounded-md">
          {imageUrl ? (
            <Image
              fill
              className="object-cover"
              alt={title}
              src={imageUrl}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-2xl">{title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Title and Category */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 group-hover:text-primary dark:group-hover:text-gold transition-colors line-clamp-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
            {category && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {category}
                </span>
              </div>
            )}
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>{chaptersLength} {chaptersLength === 1 ? 'Chapter' : 'Chapters'}</span>
            </div>
            {progressDetails && (
              <div className="flex items-center gap-1">
                <PlayIcon className="w-4 h-4" />
                <span>{progressDetails.totalVideos} {progressDetails.totalVideos === 1 ? 'Video' : 'Videos'}</span>
              </div>
            )}
          </div>

          {/* Progress Section - Only show if user is enrolled */}
          {progress !== null && progressDetails && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>{progressDetails.completedVideos}/{progressDetails.totalVideos} videos completed</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {progress}% Complete
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
