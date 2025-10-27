'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Save, X, Clock, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Editor } from '@/components/editor'
import { toast } from 'react-hot-toast'
import axios from 'axios'

interface Note {
  _id: string
  content: string
  timestamp?: number
  createdAt: Date
  updatedAt: Date
}

interface NoteSystemProps {
  chapterId: string
  courseId: string
  onTimestampClick?: (timestamp: number) => void
}

export const NoteSystem = ({ chapterId, courseId, onTimestampClick }: NoteSystemProps) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0)

  const fetchNotes = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/chapters/${chapterId}/notes`)
      setNotes(response.data)
    } catch (error) {
      // Failed to fetch notes
    }
  }, [courseId, chapterId])

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [chapterId, fetchNotes])

  const captureTimestamp = () => {
    // This would ideally get the current video timestamp from the YouTube player
    // For now, we'll use the current time as a placeholder
    const timestamp = Math.floor(Date.now() / 1000) // Current timestamp in seconds
    setCurrentTimestamp(timestamp)
    return timestamp
  }

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60)
    const seconds = timestamp % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const timestamp = captureTimestamp()
      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/notes`, {
        content: newNoteContent,
        timestamp,
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
      const response = await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/notes/${noteId}`, {
        content,
      })
      
      setNotes(notes.map(note => 
        note._id === noteId ? response.data : note
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
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        <Button
          onClick={() => setIsAddingNote(true)}
          size="sm"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Add a note at the current video time</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={captureTimestamp}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Capture Time ({formatTimestamp(currentTimestamp)})
                  </Button>
                </div>
                <Editor
                  onChange={(content) => setNewNoteContent(content)}
                  value={newNoteContent}
                />
                <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNote(false)
                    setNewNoteContent('')
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={isLoading || !newNoteContent.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 && !isAddingNote ? (
          <div className="text-center py-8 text-gray-500">
            <p>No notes yet. Add your first note to get started!</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note._id}>
              <CardContent className="p-4">
                {editingNoteId === note._id ? (
                  <div className="space-y-4">
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
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditNote(note._id, newNoteContent)}
                        disabled={isLoading || !newNoteContent.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(note.createdAt)}
                          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                            <span className="ml-2 text-xs">(edited)</span>
                          )}
                        </span>
                        {note.timestamp && (
                          <button
                            onClick={() => onTimestampClick?.(note.timestamp!)}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                          >
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(note.timestamp)}</span>
                            <Play className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNoteId(note._id)
                            setNewNoteContent(note.content)
                          }}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note._id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
