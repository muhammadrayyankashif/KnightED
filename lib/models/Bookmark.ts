import mongoose, { Document, Schema } from 'mongoose'

export interface IBookmark extends Document {
  _id: string
  userId: string
  courseId: string
  createdAt: Date
  updatedAt: Date
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

// Create compound index to ensure one bookmark per user per course
BookmarkSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.Bookmark) || mongoose.model<IBookmark>('Bookmark', BookmarkSchema)
