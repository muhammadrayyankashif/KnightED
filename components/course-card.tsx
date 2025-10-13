import Image from 'next/image'
import Link from 'next/link'
import { BookOpenIcon } from 'lucide-react'
import { IconBadge } from './icon-badge'
import { Progress } from '@/components/ui/progress'

type CourseCardProps = {
  id: string
  title: string
  imageUrl?: string
  chaptersLength: number
  progress: number | null
  category: string
  progressDetails?: {
    completedVideos: number
    totalVideos: number
  } | null
}

export default function CourseCard({
  id,
  title,
  imageUrl,
  chaptersLength,
  progress,
  category,
  progressDetails,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group h-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
          {imageUrl ? (
            <Image 
              fill 
              className="object-cover" 
              alt={title} 
              src={imageUrl} 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">{title.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col pt-4">
          <div className="line-clamp-2 text-lg font-medium transition group-hover:text-primary md:text-base">
            {title}
          </div>
          <div className="my-3 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {chaptersLength} {chaptersLength === 1 ? 'Chapter' : 'Chapters'}
            </span>
            {progressDetails && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {progressDetails.totalVideos} {progressDetails.totalVideos === 1 ? 'Video' : 'Videos'}
              </span>
            )}
          </div>
          
          {/* Progress Section - Only show if user is enrolled */}
          {progress !== null && progressDetails && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{progressDetails.completedVideos}/{progressDetails.totalVideos} videos</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="text-xs text-gray-500 text-center">
                {progress}% Complete
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
