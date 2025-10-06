import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; attachmentId: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is enrolled in the course or is the course owner
    const course = await db.course.findById(resolvedParams.courseId)

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user is enrolled or is the course owner
    const isEnrolled = await db.enrollment.findOne({
      userId: user.userId.toString(),
      courseId: resolvedParams.courseId,
    })

    const isTeacher = user.role === 'teacher' || user.role === 'admin'
    const isCourseOwner = course.createdById.toString() === user.userId.toString()

    if (!isEnrolled && !isCourseOwner && !isTeacher) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the attachment
    const attachment = await db.attachment.findById(resolvedParams.attachmentId)

    if (!attachment) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // If it's a URL resource, redirect to it
    if (attachment.resourceType === 'url') {
      return NextResponse.redirect(attachment.url)
    }

    // For file resources, fetch from the storage URL and serve
    try {
      const response = await fetch(attachment.url)

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 })
      }

      const buffer = await response.arrayBuffer()

      // Determine content type based on file extension
      let contentType = 'application/octet-stream'
      const extension = attachment.fileExtension?.toLowerCase()

      const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        txt: 'text/plain',
        csv: 'text/csv',
      }

      if (extension && mimeTypes[extension]) {
        contentType = mimeTypes[extension]
      }

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'inline; filename="' + attachment.name + '"',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to stream resource' }, { status: 500 })
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error viewing resource:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
