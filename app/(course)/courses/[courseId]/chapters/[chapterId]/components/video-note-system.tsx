'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Editor } from '@/components/editor'
import { toast } from 'react-hot-toast'
import axios from 'axios'

interface VideoNote {
  _id: string
  content: string
  videoIndex: number
  createdAt: string | Date
  updatedAt: string | Date
}

interface VideoNoteSystemProps {
  chapterId: string
  courseId: string
  videoIndex: number
}

export const VideoNoteSystem = ({ chapterId, courseId, videoIndex }: VideoNoteSystemProps) => {
  const [notes, setNotes] = useState<VideoNote[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)

  // Fetch notes for this specific video
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const fetchNotes = async () => {
      try {
        setIsLoadingNotes(true)
        const response = await axios.get(`/api/courses/${courseId}/chapters/${chapterId}/notes?videoIndex=${videoIndex}`, {
          signal: abortController.signal,
        })

        if (isMounted) {
          setNotes(response.data || [])
          setIsLoadingNotes(false)
        }
      } catch (error) {
        // Only log error if it's not an abort error
        if (!axios.isCancel(error)) {
          // eslint-disable-next-line no-console
          console.error('Error fetching notes:', error)
          if (isMounted) {
            setIsLoadingNotes(false)
          }
        }
      }
    }

    fetchNotes()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [courseId, chapterId, videoIndex])

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/notes`, {
        content: newNoteContent,
        videoIndex,
      })
      
      setNotes([response.data, ...notes])
      setNewNoteContent('')
      setIsAddingNote(false)
      toast.success('Note added successfully')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNote = async (noteId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Note content cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/notes/${noteId}`, {
        content,
      })
      
      setNotes(notes.map(note => 
        note._id === noteId ? { ...note, content, updatedAt: new Date().toISOString() } : note
      ))
      setEditingNoteId(null)
      toast.success('Note updated successfully')
    } catch (error) {
      toast.error('Failed to update note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true)
    try {
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/notes/${noteId}`)
      setNotes(notes.filter(note => note._id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      toast.error('Failed to delete note')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h4 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
          Video {videoIndex + 1} Notes
        </h4>
        <Button
          onClick={() => setIsAddingNote(true)}
          size="sm"
          className="bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoadingNotes ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-gray-600 mx-auto mb-3" />
            <p className="text-sm">Loading notes...</p>
          </div>
        ) : notes.length === 0 && !isAddingNote ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No notes for this video yet.</p>
            <p className="text-xs mt-1">Add your first note to get started!</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note._id} className="border border-gray-200 dark:border-slate-700 dark:bg-slate-900">
              <CardContent className="p-3">
                {editingNoteId === note._id ? (
                  <div className="space-y-3">
                    <Editor
                      onChange={(content) => setNewNoteContent(content)}
                      value={newNoteContent}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNoteId(null)
                          setNewNoteContent('')
                        }}
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditNote(note._id, newNoteContent)}
                        disabled={isLoading || !newNoteContent.trim()}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(note.createdAt)}
                        {new Date(note.updatedAt).getTime() !== new Date(note.createdAt).getTime() && (
                          <span className="ml-1">(edited)</span>
                        )}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNoteId(note._id)
                            setNewNoteContent(note.content)
                          }}
                          className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:bg-slate-800"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note._id)}
                          className="h-6 w-6 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <Card className="mt-3 border border-blue-200 dark:border-blue-900/50 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm dark:text-gray-50">Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Editor
                onChange={(content) => setNewNoteContent(content)}
                value={newNoteContent}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false)
                    setNewNoteContent('')
                  }}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={isLoading || !newNoteContent.trim()}
                  size="sm"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
