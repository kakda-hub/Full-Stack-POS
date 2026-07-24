import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  // ABA KHQR Merchant Configuration
  khqr: {
    merchantName: process.env.KHQR_MERCHANT_NAME || 'MiniMart Store',
    merchantCity: process.env.KHQR_MERCHANT_CITY || 'Phnom Penh',
    bankAccount: process.env.KHQR_BANK_ACCOUNT || 'demo@aba',
    currency: process.env.KHQR_CURRENCY || 'USD',
    storeLabel: process.env.KHQR_STORE_LABEL || 'Main Branch',
    merchantId: process.env.KHQR_MERCHANT_ID || 'minimart001',
    acquiringBank: process.env.KHQR_ACQUIRING_BANK || 'ABA Bank',
  },
}));
