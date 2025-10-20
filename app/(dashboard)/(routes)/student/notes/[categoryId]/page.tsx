import { redirect } from 'next/navigation'
import mongoose from 'mongoose'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isStudent } from '@/lib/teacher'
import { StudentNotesCategoryClient } from './components/student-notes-category-client'

interface PageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default async function StudentNotesCategoryPage({ params }: PageProps) {
  await connectDB()
  const { categoryId } = await params
  const user = await getCurrentUser()

  if (!user || !isStudent(user)) {
    redirect('/sign-in')
  }

  if (!mongoose.isValidObjectId(categoryId)) {
    redirect('/student/notes')
  }

  const category = await db.category.findById(categoryId)

  if (!category) {
    redirect('/student/notes')
  }

  const notes = await db.note
    .find({
      categoryId,
      isPublished: true,
    })
    .sort({ createdAt: -1 })

  const userProgress = await db.noteProgress.find({
    userId: user.userId,
    noteId: { $in: notes.map((note) => note._id.toString()) },
  })

  const serializedNotes = notes.map((note) => {
    const progress = userProgress.find((p) => p.noteId === note._id.toString())
    return {
      _id: note._id.toString(),
      title: note.title,
      fileUrl: note.fileUrl,
      fileName: note.fileName,
      categoryId: note.categoryId,
      isPublished: note.isPublished,
      createdBy: note.createdBy,
      isCompleted: progress?.isCompleted || false,
      completedAt: progress?.completedAt ? new Date(progress.completedAt).toISOString() : null,
      createdAt: note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: note.updatedAt ? new Date(note.updatedAt).toISOString() : new Date().toISOString(),
    }
  })

  return (
    <div className="space-y-6">
      <StudentNotesCategoryClient notes={serializedNotes} categoryName={category.name} categoryId={categoryId} />
    </div>
  )
}
