import mongoose, { Document, Schema } from 'mongoose'

export interface INoteProgress extends Document {
  _id: string
  userId: string
  noteId: string
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NoteProgressSchema = new Schema<INoteProgress>({
  userId: { type: String, required: true },
  noteId: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true })

// Ensure one progress record per user per note
NoteProgressSchema.index({ userId: 1, noteId: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.NoteProgress) || mongoose.model<INoteProgress>('NoteProgress', NoteProgressSchema)
