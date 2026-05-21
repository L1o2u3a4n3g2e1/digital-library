import config from '../config.js';

const cookieOptions = (days = 7) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProduction,
  path: '/',
  maxAge: days * 24 * 60 * 60 * 1000,
});

const slugId = (value) =>
  String(value || 'demo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'demo';

export default class DemoAuthService {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  setAuthCookie(response, token, days = 7) {
    response.cookie('ml_auth_token', token, cookieOptions(days));
  }

  clearAuthCookie(response) {
    response.clearCookie('ml_auth_token', { ...cookieOptions(0), maxAge: undefined, expires: new Date(0) });
  }

  buildUser(identity, mode = 'user') {
    const isGuest = mode === 'guest';
    const normalized = String(identity || '').trim();
    const name = isGuest
      ? 'Guest Reader'
      : normalized.includes('@')
        ? normalized.split('@')[0]
        : normalized || 'Demo User';

    return {
      id: `demo-${mode}-${slugId(normalized)}`,
      name,
      email: isGuest ? null : normalized,
      phone: isGuest ? normalized : null,
      is_guest: isGuest,
      is_verified: true,
      role: isGuest ? 'guest' : 'client',
      preferred_language: 'en',
      dark_mode: false,
      demo_mode: true,
    };
  }

  issueDemoToken(user, rememberMe = true) {
    return this.tokenService.signPayload(
      {
        demo: true,
        ...user,
      },
      rememberMe ? '30d' : config.jwtExpiry
    );
  }

  getCurrentUser(token) {
    if (!token) {
      return { success: false, message: 'Token required', code: 'MISSING_TOKEN' };
    }

    try {
      const payload = this.tokenService.verifyPayload(token);
      if (!payload?.demo) {
        return { success: false, message: 'Invalid demo token', code: 'TOKEN_INVALID' };
      }
      return {
        success: true,
        data: {
          id: payload.id,
          name: payload.name,
          email: payload.email || null,
          phone: payload.phone || null,
          is_guest: Boolean(payload.is_guest),
          is_verified: true,
          role: payload.role || 'client',
          preferred_language: payload.preferred_language || 'en',
          dark_mode: Boolean(payload.dark_mode),
          demo_mode: true,
        },
      };
    } catch {
      return { success: false, message: 'Invalid token', code: 'TOKEN_INVALID' };
    }
  }

  register(name, email, password, phone = null) {
    if (!name || !email || !password) {
      return { success: false, message: 'Name, email, and password are required', code: 'MISSING_FIELDS' };
    }

    const verificationCode = this.tokenService.generateDeterministicCode(email, 'verify-email');
    return {
      success: true,
      message: 'Registration successful. Use the verification code below to continue in demo mode.',
      data: {
        user_id: `demo-user-${slugId(email)}`,
        email,
        phone,
        next_step: 'verify_email',
        email_delivery: 'demo',
        verification_code: verificationCode,
        verification_expires_at: this.tokenService.getVerificationCodeExpiry(),
        demo_mode: true,
      },
    };
  }

  verifyEmail(email, code, response) {
    if (!email || !code) {
      return { success: false, message: 'Email and verification code required', code: 'MISSING_FIELDS' };
    }

    if (!this.tokenService.matchesDeterministicCode(email, 'verify-email', code)) {
      return { success: false, message: 'Invalid or expired verification code', code: 'INVALID_CODE' };
    }

    const user = this.buildUser(email, 'user');
    const token = this.issueDemoToken(user, true);
    this.setAuthCookie(response, token);

    return {
      success: true,
      message: 'Email verified successfully',
      data: { token, user },
    };
  }

  login(email, password, rememberMe, response) {
    if (!email || !password) {
      return { success: false, message: 'Email and password required', code: 'MISSING_FIELDS' };
    }

    const user = this.buildUser(email, 'user');
    const token = this.issueDemoToken(user, rememberMe);
    this.setAuthCookie(response, token, rememberMe ? 30 : 7);

    return {
      success: true,
      message: 'Login successful',
      data: { token, user },
    };
  }

  resendVerification(email) {
    if (!email) {
      return { success: false, message: 'Email is required', code: 'MISSING_EMAIL' };
    }

    return {
      success: true,
      message: 'A fresh demo verification code is ready.',
      data: {
        email,
        next_step: 'verify_email',
        email_delivery: 'demo',
        verification_code: this.tokenService.generateDeterministicCode(email, 'verify-email'),
        verification_expires_at: this.tokenService.getVerificationCodeExpiry(),
        demo_mode: true,
      },
    };
  }

  requestPasswordReset(email) {
    if (!email) {
      return { success: false, message: 'Email is required', code: 'MISSING_EMAIL' };
    }

    const resetCode = this.tokenService.signPayload(
      {
        demo: true,
        purpose: 'password-reset',
        email: String(email).trim().toLowerCase(),
      },
      '1h'
    );

    return {
      success: true,
      message: 'Password reset instructions are ready in demo mode.',
      code: 'RESET_SENT',
      data: {
        email,
        email_delivery: 'demo',
        reset_code: resetCode,
        reset_link: `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(resetCode)}`,
        demo_mode: true,
      },
    };
  }

  resetPassword(email, resetCode, newPassword) {
    if (!email || !resetCode || !newPassword) {
      return { success: false, message: 'Email, reset code, and new password are required', code: 'MISSING_FIELDS' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters', code: 'WEAK_PASSWORD' };
    }

    try {
      const payload = this.tokenService.verifyPayload(resetCode);
      if (!payload?.demo || payload?.purpose !== 'password-reset' || payload?.email !== String(email).trim().toLowerCase()) {
        return { success: false, message: 'Invalid or expired reset token', code: 'INVALID_CODE' };
      }
    } catch {
      return { success: false, message: 'Invalid or expired reset token', code: 'INVALID_CODE' };
    }

    return {
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
      code: 'PASSWORD_RESET',
    };
  }

  registerGuest(phone) {
    if (!phone) {
      return { success: false, message: 'Phone number is required', code: 'MISSING_PHONE' };
    }

    return {
      success: true,
      message: 'Guest sign-in started in demo mode. Use the verification code below.',
      data: {
        user_id: `demo-guest-${slugId(phone)}`,
        user_type: 'guest',
        phone,
        next_step: 'verify_phone',
        sms_delivery: 'simulated',
        verification_code: this.tokenService.generateDeterministicCode(phone, 'verify-phone'),
        verification_expires_at: this.tokenService.getVerificationCodeExpiry(),
        demo_mode: true,
      },
    };
  }

  verifyGuestPhone(phone, code, response) {
    if (!phone || !code) {
      return { success: false, message: 'Phone number and verification code are required', code: 'MISSING_FIELDS' };
    }

    if (!this.tokenService.matchesDeterministicCode(phone, 'verify-phone', code)) {
      return { success: false, message: 'Invalid or expired verification code', code: 'INVALID_CODE' };
    }

    const user = this.buildUser(phone, 'guest');
    const token = this.issueDemoToken(user, true);
    this.setAuthCookie(response, token);

    return {
      success: true,
      message: 'Phone verified successfully',
      data: { token, user },
    };
  }

  resendGuestVerification(phone) {
    if (!phone) {
      return { success: false, message: 'Phone number is required', code: 'MISSING_PHONE' };
    }

    return {
      success: true,
      message: 'A fresh demo SMS code is ready.',
      data: {
        phone,
        next_step: 'verify_phone',
        sms_delivery: 'simulated',
        verification_code: this.tokenService.generateDeterministicCode(phone, 'verify-phone'),
        verification_expires_at: this.tokenService.getVerificationCodeExpiry(),
        demo_mode: true,
      },
    };
  }

  logout(_token, response) {
    this.clearAuthCookie(response);
    return { success: true, message: 'Logout successful', data: {} };
  }
}
