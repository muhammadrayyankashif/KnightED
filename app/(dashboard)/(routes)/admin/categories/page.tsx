import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'
import { CategoryForm } from './components/category-form'
import { CategoryList } from './components/category-list'

export default async function AdminCategoriesPage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isAdmin(user)) {
    return redirect('/')
  }

  const categories = await db.category.find().sort({ name: 1 })

  // Convert Mongoose documents to plain objects
  const serializedCategories = categories.map(category => ({
    _id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Manage course categories for KnightED
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <CategoryForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
          <CategoryList categories={serializedCategories} />
        </div>
      </div>
    </div>
  )
}
