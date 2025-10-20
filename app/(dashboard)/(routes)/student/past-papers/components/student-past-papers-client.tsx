'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Folder,
  FileText,
  Eye,
  CheckCircle,
  Circle,
  Calendar,
  Award
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

interface PastPaper {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  categoryId: string
  categoryName: string
  year: number
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

interface CategoryData {
  categoryId: string
  categoryName: string
  pastPapers: PastPaper[]
}

export function StudentPastPapersClient() {
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPastPapers()
  }, [])

  const fetchPastPapers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/past-papers')

      if (response.ok) {
        const pastPapersData = await response.json()
        setPastPapers(pastPapersData)
      } else {
        toast.error('Failed to load past papers')
      }
    } catch (error) {
      toast.error('Failed to load past papers')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (paperId: string) => {
    window.open(`/api/student/past-papers/${paperId}/view`, '_blank')
  }

  const handleToggleComplete = async (paperId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/student/past-papers/${paperId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      })

      if (response.ok) {
        setPastPapers(prev => prev.map(paper => 
          paper._id === paperId 
            ? { ...paper, isCompleted: !currentStatus, completedAt: !currentStatus ? new Date().toISOString() : null }
            : paper
        ))
        
        toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as complete')
      } else {
        toast.error('Failed to update progress')
      }
    } catch (error) {
      toast.error('Failed to update progress')
    }
  }

  const getCategoriesData = (): CategoryData[] => {
    const categoryMap = new Map<string, CategoryData>()
    
    pastPapers.forEach(paper => {
      if (!categoryMap.has(paper.categoryId)) {
        categoryMap.set(paper.categoryId, {
          categoryId: paper.categoryId,
          categoryName: paper.categoryName,
          pastPapers: []
        })
      }
      categoryMap.get(paper.categoryId)!.pastPapers.push(paper)
    })

    return Array.from(categoryMap.values()).sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }

  const categories = getCategoriesData()

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category folders */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No past papers available"
          description="Check back soon for past papers to practice with!"
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.categoryId} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Folder className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-subheading text-sm mb-1 dark:text-gray-100">{category.categoryName}</h3>
                    <p className="text-xs text-muted-foreground font-body dark:text-gray-400">
                      {category.pastPapers.length} {category.pastPapers.length === 1 ? 'paper' : 'papers'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/student/past-papers/${category.categoryId}`}
                  >
                    View Papers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
