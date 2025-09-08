import mongoose, { Document, Schema } from 'mongoose'

export interface IPastPaperProgress extends Document {
  _id: string
  userId: string
  pastPaperId: string
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PastPaperProgressSchema = new Schema<IPastPaperProgress>({
  userId: { type: String, required: true },
  pastPaperId: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true })

// Ensure one progress record per user per past paper
PastPaperProgressSchema.index({ userId: 1, pastPaperId: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.PastPaperProgress) || mongoose.model<IPastPaperProgress>('PastPaperProgress', PastPaperProgressSchema)
