import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
}, {
  timestamps: true,
})

export default (mongoose.models && mongoose.models.User) || mongoose.model<IUser>('User', UserSchema)
