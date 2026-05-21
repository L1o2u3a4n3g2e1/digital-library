import pg from 'pg';
import config from './config.js';
import { ensureSchema } from './schema.js';
import MockPool from './mockDb.js';

const { Pool } = pg;

let pool;
let schemaPromise;
let databaseState = {
  mode: 'uninitialized',
  ready: false,
  error: null,
  lastError: null,
};

const parseConnectionUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: decodeURIComponent(url.pathname.replace(/^\//, '') || ''),
      sslmode: url.searchParams.get('sslmode') || '',
    };
  } catch {
    return null;
  }
};

const convertPlaceholders = (sql) => {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${++index}`);
};

class PostgresPoolAdapter {
  constructor(pgPool) {
    this.pgPool = pgPool;
  }

  async query(sql, params = []) {
    const text = convertPlaceholders(sql);
    const result = await this.pgPool.query({ text, values: params });
    const isSelect = /^\s*(select|with)\b/i.test(sql);

    if (isSelect) {
      return [result.rows, result];
    }

    return [
      {
        affectedRows: result.rowCount || 0,
        rowCount: result.rowCount || 0,
        insertId: null,
      },
      result,
    ];
  }

  async execute(sql, params = []) {
    const wantsInsertId = /^\s*insert\b/i.test(sql) && !/\breturning\b/i.test(sql);
    const text = wantsInsertId ? `${convertPlaceholders(sql)} RETURNING id` : convertPlaceholders(sql);
    const result = await this.pgPool.query({ text, values: params });
    const isSelect = /^\s*(select|with)\b/i.test(sql);

    if (isSelect) {
      return [result.rows, result];
    }

    return [
      {
        affectedRows: result.rowCount || 0,
        rowCount: result.rowCount || 0,
        insertId: result.rows?.[0]?.id ?? null,
      },
      result,
    ];
  }

  async end() {
    await this.pgPool.end();
  }
}

const resolveConnectionConfig = () => {
  const fromUrl =
    parseConnectionUrl(config.database.url) ||
    parseConnectionUrl(process.env.DATABASE_URL) ||
    parseConnectionUrl(process.env.POSTGRES_URL) ||
    parseConnectionUrl(process.env.POSTGRES_PRISMA_URL) ||
    parseConnectionUrl(process.env.POSTGRES_URL_NON_POOLING);

  const sslRequested = config.database.ssl || fromUrl?.sslmode === 'require';

  return {
    host: fromUrl?.host || config.database.host || '127.0.0.1',
    port: Number(fromUrl?.port || config.database.port || 5432),
    user: fromUrl?.user || config.database.user || 'postgres',
    password: fromUrl?.password || config.database.password || '',
    database: fromUrl?.database || config.database.name || 'postgres',
    connectionString: config.database.url || undefined,
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    ssl: sslRequested
      ? { rejectUnauthorized: config.database.sslRejectUnauthorized }
      : false,
  };
};

export const getDatabaseState = () => ({ ...databaseState });

export const getPool = () => {
  if (!pool) {
    pool = new PostgresPoolAdapter(new Pool(resolveConnectionConfig()));
  }

  return pool;
};

export const initializeDatabase = async () => {
  if ((config.isProduction || process.env.VERCEL) && !config.database.configured) {
    pool = new MockPool();
    databaseState = {
      mode: 'demo',
      ready: false,
      error: 'Database environment variables are not configured',
      lastError: null,
    };
    schemaPromise = Promise.resolve(pool);
    return pool;
  }

  const currentPool = getPool();

  if (!schemaPromise) {
    schemaPromise = ensureSchema(currentPool, config)
      .then(() => {
        databaseState = {
          mode: 'database',
          ready: true,
          error: null,
          lastError: null,
        };
        return currentPool;
      })
      .catch((error) => {
        if (config.isProduction || process.env.VERCEL) {
          console.warn('Database connection failed, using demo mode:', error.message);
          pool = new MockPool();
          databaseState = {
            mode: 'demo',
            ready: false,
            error: error.message,
            lastError: error,
          };
          return pool;
        }

        databaseState = {
          mode: 'database',
          ready: false,
          error: error.message,
          lastError: error,
        };
        schemaPromise = null;
        throw error;
      });
  }

  await schemaPromise;
  return pool;
};
