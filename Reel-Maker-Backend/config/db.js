const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

async function connectMongo() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_URI_SRV = process.env.MONGODB_URI_SRV;
  if (!MONGODB_URI && !MONGODB_URI_SRV) {
    const err = new Error('MONGODB_URI is not set. Add it in Vercel → Project Settings → Environment Variables');
    console.error(err.message);
    throw err;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const urisToTry = [MONGODB_URI, MONGODB_URI_SRV].filter(Boolean);

  for (const uri of urisToTry) {
    if (cached.promise) {
      try {
        cached.conn = await cached.promise;
        return cached.conn;
      } catch (_) {
        cached.promise = null;
        cached.conn = null;
        await mongoose.disconnect().catch(() => {});
      }
    }

    try {
      console.log(`🔄 Connecting to MongoDB (${uri.substring(0, 20)}...)...`);
      cached.promise = mongoose.connect(uri, { bufferCommands: false });
      cached.conn = await cached.promise;
      console.log(`📊 MongoDB ready state: ${mongoose.connection.readyState} (1=connected)`);
      return cached.conn;
    } catch (error) {
      console.warn(`⚠️  MongoDB connection failed with URI (${uri.substring(0, 20)}...): ${error.message}`);
      cached.promise = null;
      cached.conn = null;
      await mongoose.disconnect().catch(() => {});
    }
  }

  throw new Error('All MongoDB connection attempts failed');
}

function getMongoStatus() {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: states[readyState] || 'unknown',
    readyState,
    isConnected: readyState === 1,
  };
}

module.exports = { connectMongo, getMongoStatus };
