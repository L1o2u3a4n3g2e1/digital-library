import 'dotenv/config';

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const configuredAppUrl = process.env.APP_URL || '';
const defaultPort = parseNumber(process.env.PORT, 3001);

const config = {
  appName: process.env.APP_NAME || 'Digital Library',
  appEnv: process.env.APP_ENV || 'development',
  isProduction: (process.env.APP_ENV || 'development') === 'production',
  appUrl: configuredAppUrl,
  frontendUrl:
    process.env.FRONTEND_URL ||
    configuredAppUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${defaultPort}`),
  port: defaultPort,
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-before-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  verificationCodeLength: parseNumber(process.env.VERIFICATION_CODE_LENGTH, 6),
  verificationCodeExpirySeconds: parseNumber(process.env.VERIFICATION_CODE_EXPIRY, 900),
  maxUploadSize: parseNumber(process.env.MAX_UPLOAD_SIZE, 50 * 1024 * 1024),
  logLevel: process.env.LOG_LEVEL || 'info',
  allowedOrigins: Array.from(
    new Set(
      [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        ...parseCsv(process.env.ALLOWED_ORIGINS),
        process.env.FRONTEND_URL,
        process.env.APP_URL,
      ].filter(Boolean)
    )
  ),
  mail: {
    host: process.env.MAIL_HOST || '',
    port: parseNumber(process.env.MAIL_PORT, 587),
    secure: parseBoolean(process.env.MAIL_SECURE, false),
    user: process.env.MAIL_USERNAME || '',
    pass: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || process.env.MAIL_USERNAME || '',
    fromName: process.env.MAIL_FROM_NAME || 'Digital Library',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'simulated',
    mode: process.env.SMS_MODE || '',
    username: process.env.AT_USERNAME || process.env.SMS_USERNAME || '',
    apiKey: process.env.AT_API_KEY || process.env.SMS_API_KEY || '',
    senderId: process.env.AT_SENDER_ID || process.env.SMS_SENDER_ID || '',
  },
};

export default config;
