import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  _id: string
  userId: string // Recipient of the notification
  type: 'comment_reply' | 'course_update' | 'chapter_upload' // Type of notification
  content: string // Brief notification message
  read: boolean

  // For comment reply notifications
  commentId?: string // The reply comment ID
  originalCommentId?: string // The original comment being replied to
  repliedByUserId?: string // Who replied

  // For course/chapter update notifications
  courseId?: string
  chapterId?: string

  // For displaying which video the comment was on
  videoIndex?: number
  videoTitle?: string // Title/name of the video

  // Metadata
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['comment_reply', 'course_update', 'chapter_upload'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  commentId: {
    type: String,
    default: null,
  },
  originalCommentId: {
    type: String,
    default: null,
  },
  repliedByUserId: {
    type: String,
    default: null,
  },
  courseId: {
    type: String,
    default: null,
  },
  chapterId: {
    type: String,
    default: null,
  },
  videoIndex: {
    type: Number,
    default: null,
  },
  videoTitle: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
})

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, read: 1 })
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 })

export default (mongoose.models && mongoose.models.Notification) || mongoose.model<INotification>('Notification', NotificationSchema)
