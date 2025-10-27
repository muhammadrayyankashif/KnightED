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

    const notes = await db.note.find({}).sort({ createdAt: -1 })

    const notesWithCategory = await Promise.all(
      notes.map(async (note) => {
        const category = await db.category.findById(note.categoryId)
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
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }
      })
    )

    return NextResponse.json(notesWithCategory)
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

    const { title, fileUrl, fileName, fileSize, fileExtension, categoryId } = await req.json()

    if (!title || !fileUrl || !fileName || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const category = await db.category.findById(categoryId)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const note = await db.note.create({
      title,
      fileUrl,
      fileName,
      fileSize: fileSize || 0,
      fileExtension: fileExtension || (fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : ''),
      categoryId,
      createdBy: user.userId.toString(),
    })

    return NextResponse.json({
      _id: note._id.toString(),
      title: note.title,
      fileUrl: note.fileUrl,
      fileName: note.fileName,
      fileSize: note.fileSize,
      categoryId: note.categoryId,
      categoryName: category.name,
      isPublished: note.isPublished,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
