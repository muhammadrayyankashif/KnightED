import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

// PATCH - Mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { read } = await req.json()

    if (typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid read value. Must be a boolean' },
        { status: 400 }
      )
    }

    // Find the notification and ensure it belongs to the current user
    const notification = await db.notification.findById(resolvedParams.notificationId)

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== user.userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - this notification does not belong to you' },
        { status: 403 }
      )
    }

    // Update the notification
    notification.read = read
    await notification.save()

    return NextResponse.json({
      _id: notification._id.toString(),
      userId: notification.userId,
      type: notification.type,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error updating notification:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the notification and ensure it belongs to the current user
    const notification = await db.notification.findById(resolvedParams.notificationId)

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== user.userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - this notification does not belong to you' },
        { status: 403 }
      )
    }

    // Delete the notification
    await db.notification.deleteOne({ _id: resolvedParams.notificationId })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error deleting notification:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
