'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  Circle, 
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PastPaper {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  categoryId: string
  year: number
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

interface StudentPastPapersCategoryClientProps {
  pastPapers: PastPaper[]
  categoryName: string
  categoryId: string
}

export function StudentPastPapersCategoryClient({ 
  pastPapers: initialPastPapers, 
  categoryName, 
  categoryId 
}: StudentPastPapersCategoryClientProps) {
  const [pastPapers, setPastPapers] = useState<PastPaper[]>(initialPastPapers)
  const [loading, setLoading] = useState(false)

  const handleView = (paperId: string) => {
    window.open(`/api/student/past-papers/${paperId}/view`, '_blank')
  }

  const handleToggleComplete = async (paperId: string, currentStatus: boolean) => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  if (pastPapers.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-50">{categoryName} Past Papers</h1>
        </div>

        <Card className="dark:bg-slate-900">
          <CardContent className="flex items-center justify-center h-32 p-4">
            <p className="text-muted-foreground text-center dark:text-gray-400">No past papers available in this category</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-subheading dark:text-gray-50">{categoryName} Past Papers</h1>
      </div>

      {/* Past papers list */}
      <div className="space-y-3">
        {pastPapers.map((paper) => (
          <Card key={paper._id} className="dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* File info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate dark:text-gray-100">{paper.title}</p>
                    <p className="text-sm text-muted-foreground truncate dark:text-gray-400">{paper.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700">{paper.year}</Badge>
                      <Calendar className="h-3 w-3 text-muted-foreground dark:text-gray-400" />
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        {new Date(paper.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComplete(paper._id, paper.isCompleted)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 text-sm dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    {paper.isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    )}
                    <span className="hidden sm:inline">
                      {paper.isCompleted ? 'Completed' : 'Mark Complete'}
                    </span>
                    <span className="sm:hidden">
                      {paper.isCompleted ? 'Done' : 'Mark'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(paper._id)}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
