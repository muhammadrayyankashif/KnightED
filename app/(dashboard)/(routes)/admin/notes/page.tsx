import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { NotesTable } from './components/notes-table'

export default async function AdminNotesPage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isAdmin(user)) {
    return redirect('/')
  }

  const notes = await db.note.find({}).sort({ createdAt: -1 })
  const categories = await db.category.find({})

  // Convert categories to plain objects
  const serializedCategories = categories.map(category => ({
    _id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }))

  // Convert to plain objects and add category names
  const notesWithCategory = await Promise.all(
    notes.map(async (note) => {
      const category = categories.find(cat => cat._id.toString() === note.categoryId)
      return {
        _id: note._id.toString(),
        title: note.title,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        fileSize: note.fileSize,
        categoryId: note.categoryId,
        categoryName: category?.name || 'Unknown',
        isPublished: note.isPublished,
        createdBy: note.createdBy,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }
    })
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes Management</h1>
          <p className="text-muted-foreground">
            Manage educational notes and study materials
          </p>
        </div>
        <Link href="/admin/notes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Note
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              Available notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Available subjects
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesTable notes={notesWithCategory} />
        </CardContent>
      </Card>
    </div>
  )
}
