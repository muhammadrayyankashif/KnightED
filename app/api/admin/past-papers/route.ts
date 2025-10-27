import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pastPapers = await db.pastPaper.find({}).sort({ createdAt: -1 })

    const pastPapersWithCategory = await Promise.all(
      pastPapers.map(async (paper) => {
        const category = await db.category.findById(paper.categoryId)
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
          createdAt: paper.createdAt,
          updatedAt: paper.updatedAt,
        }
      })
    )

    return NextResponse.json(pastPapersWithCategory)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, fileUrl, fileName, fileSize, fileExtension, categoryId, year } = await req.json()

    if (!title || !fileUrl || !fileName || !categoryId || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const category = await db.category.findById(categoryId)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const pastPaper = await db.pastPaper.create({
      title,
      fileUrl,
      fileName,
      fileSize: fileSize || 0,
      fileExtension: fileExtension || (fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : ''),
      categoryId,
      year: parseInt(year),
      createdBy: user.userId.toString(),
    })

    return NextResponse.json({
      _id: pastPaper._id.toString(),
      title: pastPaper.title,
      fileUrl: pastPaper.fileUrl,
      fileName: pastPaper.fileName,
      fileSize: pastPaper.fileSize,
      categoryId: pastPaper.categoryId,
      categoryName: category.name,
      year: pastPaper.year,
      isPublished: pastPaper.isPublished,
      createdBy: pastPaper.createdBy,
      createdAt: pastPaper.createdAt,
      updatedAt: pastPaper.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
