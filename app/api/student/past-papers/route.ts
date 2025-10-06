import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pastPapers = await db.pastPaper.find({ isPublished: true }).sort({ createdAt: -1 })
    const categories = await db.category.find({})

    const userProgress = await db.pastPaperProgress.find({ userId: user.userId })

    const pastPapersWithProgress = await Promise.all(
      pastPapers.map(async (paper) => {
        const category = categories.find(cat => cat._id.toString() === paper.categoryId)
        const progress = userProgress.find(p => p.pastPaperId === paper._id.toString())
        
        return {
          _id: paper._id.toString(),
          title: paper.title,
          fileUrl: paper.fileUrl,
          fileName: paper.fileName,
          categoryId: paper.categoryId,
          categoryName: category?.name || 'Unknown',
          year: paper.year,
          isCompleted: progress?.isCompleted || false,
          completedAt: progress?.completedAt?.toISOString() || null,
          createdAt: paper.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json(pastPapersWithProgress)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
