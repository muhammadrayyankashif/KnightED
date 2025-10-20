import { Skeleton } from '@/components/ui/skeleton'

export const CourseSkeleton = () => {
  return (
    <div className="group flex gap-4 p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="relative w-48 flex-shrink-0 overflow-hidden rounded-md my-2 bg-slate-200 dark:bg-slate-700" />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-2/3" />

        {/* Category */}
        <Skeleton className="h-6 w-24" />

        {/* Stats */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export const CourseSkeletonList = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CourseSkeleton key={i} />
      ))}
    </div>
  )
}
