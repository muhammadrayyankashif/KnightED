import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paperId } = await params
    const pastPaper = await db.pastPaper.findById(paperId)

    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 })
    }

    const isCloudinary = pastPaper.fileUrl.includes('cloudinary.com') || pastPaper.fileUrl.includes('res.cloudinary.com')

    if (!isCloudinary) {
      return NextResponse.redirect(pastPaper.fileUrl)
    }

    const response = await fetch(pastPaper.fileUrl)
    if (!response.ok) {
      return NextResponse.redirect(pastPaper.fileUrl)
    }

    const pdfBuffer = await response.arrayBuffer()

    let fileName = pastPaper.fileName || pastPaper.title || 'past-paper'
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
