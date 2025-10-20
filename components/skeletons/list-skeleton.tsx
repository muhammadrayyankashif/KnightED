import { Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  count?: number
  hasImage?: boolean
}

export const ListSkeleton = ({ count = 5, hasImage = true }: ListSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg animate-pulse">
          {hasImage && (
            <div className="w-32 h-24 bg-slate-200 dark:bg-slate-800 rounded flex-shrink-0" />
          )}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
