export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await db.note.findOne({ _id: noteId, isPublished: true })
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check if it's an uploaded file (Cloudinary) or an external link
    const isCloudinary = note.fileUrl.includes('cloudinary.com') || note.fileUrl.includes('res.cloudinary.com')

    if (!isCloudinary) {
      // External link: redirect directly to the URL
      return NextResponse.redirect(note.fileUrl)
    }

    // Uploaded Cloudinary file: fetch and stream as inline PDF
    const response = await fetch(note.fileUrl)
    if (!response.ok) {
      return NextResponse.redirect(note.fileUrl)
    }

    const fileBuffer = await response.arrayBuffer()

    let fileName = note.fileName || note.title || 'document'
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName = `${fileName}.pdf`
    }

    return new NextResponse(fileBuffer, {
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
