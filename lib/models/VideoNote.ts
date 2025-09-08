import mongoose, { Document, Schema } from 'mongoose'

export interface IVideoNote extends Document {
  _id: string
  content: string
  videoIndex: number
  chapterId: string
  courseId: string
  userId: string
  timestamp?: string
  createdAt: Date
  updatedAt: Date
}

const VideoNoteSchema = new Schema<IVideoNote>({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  videoIndex: {
    type: Number,
    default: 0,
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
  timestamp: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
})

// Create indexes for efficient queries
VideoNoteSchema.index({ chapterId: 1, userId: 1, videoIndex: 1 })
VideoNoteSchema.index({ userId: 1, createdAt: -1 })
VideoNoteSchema.index({ courseId: 1, chapterId: 1 })

export default (mongoose.models && mongoose.models.VideoNote) || mongoose.model<IVideoNote>('VideoNote', VideoNoteSchema)
