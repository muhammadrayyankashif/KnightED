import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { CreatePastPaperForm } from './components/create-past-paper-form'

export default async function CreatePastPaperPage() {
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
        <h1 className="text-3xl font-bold">Add New Past Paper</h1>
        <p className="text-muted-foreground">
          Upload a PDF past paper and organize it by subject and year
        </p>
      </div>

      <CreatePastPaperForm categories={serializedCategories} />
    </div>
  )
}
