'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Eye, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Note {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  categoryId: string
  categoryName: string
  isPublished: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface NotesTableProps {
  notes: Note[]
}

export function NotesTable({ notes }: NotesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    setDeletingId(noteId)
    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      toast.success('Note deleted successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete note')
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (noteId: string) => {
    window.open(`/api/admin/notes/${noteId}/view`, '_blank')
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by adding a new note.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note._id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{note.title}</div>
                  <div className="text-sm text-muted-foreground">{note.fileName}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{note.categoryName}</Badge>
              </TableCell>
              <TableCell>{formatDate(note.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(note._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note._id)}
                    disabled={deletingId === note._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
