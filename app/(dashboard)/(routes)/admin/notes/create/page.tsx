import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { CreateNoteForm } from './components/create-note-form'

export default async function CreateNotePage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isAdmin(user)) {
    return redirect('/')
  }

  const categories = await db.category.find({}).sort({ name: 1 })

  // Convert categories to plain objects
  const serializedCategories = categories.map(category => ({
    _id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Note</h1>
        <p className="text-muted-foreground">
          Upload a PDF note and organize it by subject
        </p>
      </div>

      <CreateNoteForm categories={serializedCategories} />
    </div>
  )
}
