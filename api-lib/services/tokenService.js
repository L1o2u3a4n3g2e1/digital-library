import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import config from '../config.js';
import { toMysqlDateTime } from '../repositories/userRepository.js';

export default class TokenService {
  generateToken(userId, emailOrPhone, role = 'client') {
    return jwt.sign({ userId, subject: emailOrPhone, role }, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });
  }

  verifyToken(token) {
    try {
      return { success: true, data: jwt.verify(token, config.jwtSecret) };
    } catch (error) {
      return {
        success: false,
        code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      };
    }
  }

  generateVerificationCode() {
    const min = 10 ** (config.verificationCodeLength - 1);
    const max = (10 ** config.verificationCodeLength) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

  getVerificationCodeExpiry(seconds = config.verificationCodeExpirySeconds) {
    const value = new Date(Date.now() + seconds * 1000);
    return toMysqlDateTime(value);
  }

  generateOpaqueToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
