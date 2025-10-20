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

interface Note {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  categoryId: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

interface StudentNotesCategoryClientProps {
  notes: Note[]
  categoryName: string
  categoryId: string
}

export function StudentNotesCategoryClient({ 
  notes: initialNotes, 
  categoryName, 
  categoryId 
}: StudentNotesCategoryClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [loading, setLoading] = useState(false)

  const handleView = (noteId: string) => {
    window.open(`/api/student/notes/${noteId}/view`, '_blank')
  }

  const handleToggleComplete = async (noteId: string, currentStatus: boolean) => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  if (notes.length === 0) {
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
          <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-50">{categoryName} Notes</h1>
        </div>

        <Card className="dark:bg-slate-900">
          <CardContent className="flex items-center justify-center h-32 p-4">
            <p className="text-muted-foreground text-center dark:text-gray-400">No notes available in this category</p>
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
        <h1 className="text-xl sm:text-2xl font-subheading dark:text-gray-50">{categoryName} Notes</h1>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note._id} className="dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* File info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate dark:text-gray-100">{note.title}</p>
                    <p className="text-sm text-muted-foreground truncate dark:text-gray-400">{note.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground dark:text-gray-400" />
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComplete(note._id, note.isCompleted)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 text-sm dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    {note.isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    )}
                    <span className="hidden sm:inline">
                      {note.isCompleted ? 'Completed' : 'Mark Complete'}
                    </span>
                    <span className="sm:hidden">
                      {note.isCompleted ? 'Done' : 'Mark'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(note._id)}
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
