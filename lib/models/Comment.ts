import mongoose, { Document, Schema } from 'mongoose'

export interface IComment extends Document {
  _id: string
  content: string
  videoIndex: number // Index of the video within the chapter
  chapterId: string
  courseId: string
  userId: string
  parentCommentId?: string // For replies - null for top-level comments
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000, // Limit comment length
  },
  videoIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  chapterId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: String,
    default: null, // null for top-level comments
  },
}, {
  timestamps: true,
})

// Create compound index for efficient queries
CommentSchema.index({ courseId: 1, chapterId: 1, videoIndex: 1, parentCommentId: 1 })
CommentSchema.index({ chapterId: 1, videoIndex: 1, parentCommentId: 1 })
CommentSchema.index({ userId: 1, createdAt: -1 })
CommentSchema.index({ courseId: 1, createdAt: -1 })

export default (mongoose.models && mongoose.models.Comment) || mongoose.model<IComment>('Comment', CommentSchema)
