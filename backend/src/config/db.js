const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported
}

let mongodInstance = null;

// Helper to normalize and encode URI components safely
const sanitizeMongoUri = (rawUri) => {
  if (!rawUri) return rawUri;

  try {
    const srvPrefix = 'mongodb+srv://';
    const stdPrefix = 'mongodb://';
    let prefix = '';
    let rest = '';

    if (rawUri.startsWith(srvPrefix)) {
      prefix = srvPrefix;
      rest = rawUri.slice(srvPrefix.length);
    } else if (rawUri.startsWith(stdPrefix)) {
      prefix = stdPrefix;
      rest = rawUri.slice(stdPrefix.length);
    } else {
      return rawUri;
    }

    // Split at the LAST '@' which separates credentials from the cluster host
    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex === -1) return rawUri;

    const authPart = rest.substring(0, lastAtIndex);
    const hostPart = rest.substring(lastAtIndex + 1);

    const colonIndex = authPart.indexOf(':');
    if (colonIndex === -1) return rawUri;

    const username = authPart.substring(0, colonIndex);
    const password = authPart.substring(colonIndex + 1);

    // Properly encode username & password for MongoDB URI specification
    const encodedUsername = encodeURIComponent(decodeURIComponent(username));
    const encodedPassword = encodeURIComponent(decodeURIComponent(password));

    return `${prefix}${encodedUsername}:${encodedPassword}@${hostPart}`;
  } catch (err) {
    return rawUri;
  }
};

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;
  const uri = sanitizeMongoUri(rawUri);

  try {
    if (uri && !uri.includes('memory')) {
      try {
        console.log('Connecting to MongoDB Atlas / Remote Cluster...');
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 6000,
        });
        console.log('MongoDB connected successfully to Remote Cluster');
        return;
      } catch (err) {
        console.warn(`Could not connect to configured MongoDB (${err.message})`);
        if (process.env.NODE_ENV === 'production') {
          throw err;
        }
        console.log('Falling back to local in-memory MongoDB for local development...');
      }
    }

    // Fallback for development if external MongoDB is unavailable
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        timeout: 120000,
      },
      binary: {
        timeout: 120000,
      },
    });
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`In-Memory MongoDB connected successfully for development`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
