import mongoose, { Document, Schema } from 'mongoose'

export interface IVideoProgress extends Document {
  _id: string
  userId: string
  courseId: string
  chapterId: string
  videoIndex: number // Index of the video within the chapter
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const VideoProgressSchema = new Schema<IVideoProgress>({
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  chapterId: {
    type: String,
    required: true,
  },
  videoIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Create compound index for unique user-video combination
VideoProgressSchema.index({ userId: 1, courseId: 1, chapterId: 1, videoIndex: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.VideoProgress) || mongoose.model<IVideoProgress>('VideoProgress', VideoProgressSchema)
