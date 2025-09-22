'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

// Polling interval for refreshing notifications (in milliseconds)
const NOTIFICATION_POLLING_INTERVAL = 30000 // 30 seconds

export interface Notification {
  _id: string
  userId: string
  type: 'comment_reply' | 'course_update' | 'chapter_upload'
  content: string
  read: boolean
  commentId?: string
  originalCommentId?: string
  repliedByUserId?: string
  courseId?: string
  chapterId?: string
  videoIndex?: number
  videoTitle?: string
  createdAt: Date
  updatedAt: Date
  course?: { _id: string; title: string }
  chapter?: { _id: string; title: string }
  comment?: { _id: string; content: string; userId?: any }
  repliedByUser?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/notifications')
      setNotifications(response.data)

      // Count unread notifications
      const unread = response.data.filter((n: Notification) => !n.read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error instanceof Error ? error.message : error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}`, { read: true })
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error instanceof Error ? error.message : error)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`)

      // Update state using a functional update to access current state
      setNotifications((prev) => {
        // Decrement unread count if the deleted notification was unread
        const deletedNotification = prev.find((n) => n._id === notificationId)
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
        }
        return prev.filter((n) => n._id !== notificationId)
      })
    } catch (error) {
      console.error('Error deleting notification:', error instanceof Error ? error.message : error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications at regular intervals
    const interval = setInterval(fetchNotifications, NOTIFICATION_POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  }
}
