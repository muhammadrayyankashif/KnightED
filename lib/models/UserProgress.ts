import mongoose, { Document, Schema } from 'mongoose'

export interface IUserProgress extends Document {
  _id: string
  userId: string
  chapterId: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: {
    type: String,
    required: true,
  },
  chapterId: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Create compound index for unique user-chapter combination
UserProgressSchema.index({ userId: 1, chapterId: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.UserProgress) || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)
