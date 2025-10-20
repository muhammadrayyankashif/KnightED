import { redirect } from 'next/navigation'
import mongoose from 'mongoose'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isStudent } from '@/lib/teacher'
import { StudentPastPapersCategoryClient } from './components/student-past-papers-category-client'

interface PageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default async function StudentPastPapersCategoryPage({ params }: PageProps) {
  await connectDB()
  const { categoryId } = await params
  const user = await getCurrentUser()

  if (!user || !isStudent(user)) {
    redirect('/sign-in')
  }

  if (!mongoose.isValidObjectId(categoryId)) {
    redirect('/student/past-papers')
  }

  const category = await db.category.findById(categoryId)

  if (!category) {
    redirect('/student/past-papers')
  }

  const pastPapers = await db.pastPaper
    .find({
      categoryId,
      isPublished: true,
    })
    .sort({ year: -1 })

  const userProgress = await db.pastPaperProgress.find({
    userId: user.userId,
    pastPaperId: { $in: pastPapers.map((paper) => paper._id.toString()) },
  })

  const serializedPastPapers = pastPapers.map((paper) => {
    const progress = userProgress.find((p) => p.pastPaperId === paper._id.toString())
    return {
      _id: paper._id.toString(),
      title: paper.title,
      fileUrl: paper.fileUrl,
      fileName: paper.fileName,
      categoryId: paper.categoryId,
      year: paper.year,
      isPublished: paper.isPublished,
      createdBy: paper.createdBy,
      isCompleted: progress?.isCompleted || false,
      completedAt: progress?.completedAt ? new Date(progress.completedAt).toISOString() : null,
      createdAt: paper.createdAt ? new Date(paper.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: paper.updatedAt ? new Date(paper.updatedAt).toISOString() : new Date().toISOString(),
    }
  })

  return (
    <div className="space-y-6">
      <StudentPastPapersCategoryClient
        pastPapers={serializedPastPapers}
        categoryName={category.name}
        categoryId={categoryId}
      />
    </div>
  )
}
