import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { noteId } = await params
    const note = await db.note.findById(noteId)

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const isCloudinary = note.fileUrl.includes('cloudinary.com') || note.fileUrl.includes('res.cloudinary.com')

    if (!isCloudinary) {
      return NextResponse.redirect(note.fileUrl)
    }

    const response = await fetch(note.fileUrl)
    if (!response.ok) {
      return NextResponse.redirect(note.fileUrl)
    }

    const pdfBuffer = await response.arrayBuffer()

    let fileName = note.fileName || note.title || 'document'
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName = `${fileName}.pdf`
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
