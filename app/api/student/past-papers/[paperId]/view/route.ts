export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(req: NextRequest, { params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pastPaper = await db.pastPaper.findOne({ _id: paperId, isPublished: true })
    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 })
    }

    // Check if it's an uploaded file (Cloudinary) or an external link
    const isCloudinary = pastPaper.fileUrl.includes('cloudinary.com') || pastPaper.fileUrl.includes('res.cloudinary.com')

    if (!isCloudinary) {
      // External link: redirect directly to the URL
      return NextResponse.redirect(pastPaper.fileUrl)
    }

    // Uploaded Cloudinary file: fetch and stream as inline PDF
    const response = await fetch(pastPaper.fileUrl)
    if (!response.ok) {
      return NextResponse.redirect(pastPaper.fileUrl)
    }

    const fileBuffer = await response.arrayBuffer()

    let fileName = pastPaper.fileName || pastPaper.title || 'past-paper'
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
