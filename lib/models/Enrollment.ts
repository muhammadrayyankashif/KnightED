import mongoose, { Document, Schema } from 'mongoose'

export interface IEnrollment extends Document {
  _id: string
  userId: string
  courseId: string
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>({
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

// Create compound index for unique user-course combination
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default (mongoose.models && mongoose.models.Enrollment) || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
