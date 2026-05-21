import config from '../config.js';
import { nowMysql } from '../repositories/userRepository.js';

const formatNow = () => nowMysql();

export default class SmsService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  resolveMode() {
    if (config.sms.mode) {
      return config.sms.mode;
    }

    if (!config.sms.provider || config.sms.provider === 'simulated') {
      return 'simulated';
    }

    if (config.sms.provider === 'africastalking') {
      if (config.sms.username && config.sms.apiKey) {
        return config.isProduction ? 'live' : 'sandbox';
      }
      return 'unconfigured';
    }

    return 'unconfigured';
  }

  async sendGuestVerificationCode(userId, phone, code) {
    const mode = this.resolveMode();
    const message = `Your ${config.appName} guest verification code is ${code}.`;

    if (mode === 'live') {
      await this.userRepository.persistSmsLog({
        userId,
        recipientPhone: phone,
        message,
        status: 'failed',
        errorMessage: 'Live SMS transport is not implemented in this build',
      });

      return {
        success: false,
        delivery: 'unconfigured',
        message: 'Live SMS provider still needs implementation details',
        error: 'SMS_NOT_IMPLEMENTED',
      };
    }

    await this.userRepository.persistSmsLog({
      userId,
      recipientPhone: phone,
      message,
      status: mode === 'sandbox' ? 'sent' : 'failed',
      errorMessage: mode === 'sandbox' ? 'Sandbox mode - simulator only' : 'Simulated delivery only',
      sentAt: formatNow(),
    });

    return {
      success: mode === 'sandbox',
      delivery: mode,
      message:
        mode === 'sandbox'
          ? 'SMS sent to sandbox simulator'
          : 'Real SMS delivery is not configured',
      error: mode === 'sandbox' ? null : 'SMS_UNAVAILABLE',
    };
  }
}
