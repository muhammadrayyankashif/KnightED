import { Skeleton } from '@/components/ui/skeleton'

export const ChapterSkeleton = () => {
  return (
    <div className="p-3 border rounded-lg animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
    </div>
  )
}

export const ChaptersSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ChapterSkeleton key={i} />
      ))}
    </div>
  )
}
