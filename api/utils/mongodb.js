const { MongoClient } = require('mongodb');

/**
 * Vercel Serverless 환경에서 MongoDB 연결을 위한 헬퍼
 * MongoClient를 캐싱하여 재사용합니다.
 */

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/busung_hr';
const DB_NAME = process.env.DB_NAME || 'busung_hr';

// MongoClient 캐싱을 위한 전역 변수
let cachedClient = null;
let cachedDb = null;

const options = {
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  socketTimeoutMS: 45000, // 45초 소켓 타임아웃
  maxPoolSize: 10, // 연결 풀 크기
};

/**
 * MongoDB 연결 함수
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
async function connectToDatabase() {
  // 이미 연결이 캐시되어 있으면 재사용
  if (cachedClient && cachedDb) {
    console.log('✅ Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // 새로운 연결 생성
    console.log('🔌 Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(DB_NAME);

    console.log(`✅ MongoDB Connected: ${MONGODB_URI}`);
    console.log(`📦 Database: ${DB_NAME}`);

    // 연결 캐싱
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

/**
 * MongoDB 연결 종료 (Vercel 환경에서는 일반적으로 사용하지 않음)
 */
async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
};
