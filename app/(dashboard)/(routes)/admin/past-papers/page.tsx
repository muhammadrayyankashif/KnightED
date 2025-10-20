import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { PastPapersTable } from './components/past-papers-table'

export default async function AdminPastPapersPage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isAdmin(user)) {
    return redirect('/')
  }

  const pastPapers = await db.pastPaper.find({}).sort({ createdAt: -1 })
  const categories = await db.category.find({})

  // Convert categories to plain objects
  const serializedCategories = categories.map(category => ({
    _id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }))

  // Convert to plain objects and add category names
  const pastPapersWithCategory = await Promise.all(
    pastPapers.map(async (paper) => {
      const category = categories.find(cat => cat._id.toString() === paper.categoryId)
      return {
        _id: paper._id.toString(),
        title: paper.title,
        fileUrl: paper.fileUrl,
        fileName: paper.fileName,
        fileSize: paper.fileSize,
        categoryId: paper.categoryId,
        categoryName: category?.name || 'Unknown',
        year: paper.year,
        isPublished: paper.isPublished,
        createdBy: paper.createdBy,
        createdAt: paper.createdAt.toISOString(),
        updatedAt: paper.updatedAt.toISOString(),
      }
    })
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Past Papers Management</h1>
          <p className="text-muted-foreground">
            Manage past exam papers and practice materials
          </p>
        </div>
        <Link href="/admin/past-papers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Past Paper
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Past Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastPapers.length}</div>
            <p className="text-xs text-muted-foreground">
              Available papers
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
          <CardTitle>All Past Papers</CardTitle>
        </CardHeader>
        <CardContent>
          <PastPapersTable pastPapers={pastPapersWithCategory} />
        </CardContent>
      </Card>
    </div>
  )
}
