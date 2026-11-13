import mongoose from 'mongoose';
import config from './environment.js';

let isConnected = false;

export async function connectDatabase(customUri = null) {
  const uri = customUri || config.mongodb.uri;

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    isConnected = false;
    throw error;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly');
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB connection lost');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[Database] MongoDB reconnected');
});

export default { connectDatabase, disconnectDatabase };
