import mongoose from 'mongoose';
import config from './environment.js';

let isConnected = false;

export async function connectDatabase(uri = config.mongodbUri) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[Database] MongoDB disconnected. Waiting for reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[Database] MongoDB reconnected successfully.');
    });

    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.error(`[Database] Failed to connect to MongoDB at ${uri}:`, error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected gracefully.');
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export default {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected
};

