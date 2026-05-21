import mysql from 'mysql2/promise';
import config from './config.js';
import { ensureSchema } from './schema.js';

let pool;
let schemaPromise;

const parseConnectionUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: decodeURIComponent(url.pathname.replace(/^\//, '') || ''),
    };
  } catch {
    return null;
  }
};

const resolveConnectionConfig = () => {
  const fromUrl =
    parseConnectionUrl(process.env.DATABASE_URL) ||
    parseConnectionUrl(process.env.MYSQL_URL) ||
    parseConnectionUrl(process.env.MYSQL_PUBLIC_URL);

  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || fromUrl?.host || '127.0.0.1',
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || fromUrl?.port || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || fromUrl?.user || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || fromUrl?.password || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || fromUrl?.database || 'multilingual_library',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    charset: 'utf8mb4',
  };
};

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(resolveConnectionConfig());
  }

  return pool;
};

export const initializeDatabase = async () => {
  const currentPool = getPool();

  if (!schemaPromise) {
    schemaPromise = ensureSchema(currentPool, config).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
  return currentPool;
};
