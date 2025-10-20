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
  BookMarked
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

interface Note {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  categoryId: string
  categoryName: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

interface CategoryData {
  categoryId: string
  categoryName: string
  notes: Note[]
}

export function StudentNotesClient() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/notes')

      if (response.ok) {
        const notesData = await response.json()
        setNotes(notesData)
      } else {
        toast.error('Failed to load notes')
      }
    } catch (error) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (noteId: string) => {
    window.open(`/api/student/notes/${noteId}/view`, '_blank')
  }

  const handleToggleComplete = async (noteId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/student/notes/${noteId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      })

      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note._id === noteId 
            ? { ...note, isCompleted: !currentStatus, completedAt: !currentStatus ? new Date().toISOString() : null }
            : note
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
    
    notes.forEach(note => {
      if (!categoryMap.has(note.categoryId)) {
        categoryMap.set(note.categoryId, {
          categoryId: note.categoryId,
          categoryName: note.categoryName,
          notes: []
        })
      }
      categoryMap.get(note.categoryId)!.notes.push(note)
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
          icon={BookMarked}
          title="No study notes yet"
          description="Your study notes will appear here. Check back soon!"
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.categoryId} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-subheading text-sm mb-1 dark:text-gray-100">{category.categoryName}</h3>
                    <p className="text-xs text-muted-foreground font-body dark:text-gray-400">
                      {category.notes.length} {category.notes.length === 1 ? 'note' : 'notes'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/student/notes/${category.categoryId}`}
                  >
                    View Notes
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
