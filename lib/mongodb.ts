import mongoose from 'mongoose'

function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('Warning: MONGODB_URI is not defined. Database operations will fail if called.')
    return ''
  }
  return uri
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const uri = getMongoUri()
    if (!uri) {
      return null
    }
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
