import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KhqrService {
  private merchantName: string;
  private merchantCity: string;
  private bankAccount: string;
  private storeLabel: string;
  private merchantId: string;
  private acquiringBank: string;
  private currencyCode: number; // 840 = USD, 116 = KHR

  constructor(private configService: ConfigService) {
    const khqr = this.configService.get('app.khqr');
    this.merchantName = khqr?.merchantName || 'MiniMart Store';
    this.merchantCity = khqr?.merchantCity || 'Phnom Penh';
    this.bankAccount = khqr?.bankAccount || 'demo@aba';
    this.storeLabel = khqr?.storeLabel || 'Main Branch';
    this.merchantId = khqr?.merchantId || 'minimart001';
    this.acquiringBank = khqr?.acquiringBank || 'ABA Bank';

    // KHQR uses numeric EMV currency codes: 840 = USD, 116 = KHR
    const currency = khqr?.currency || 'USD';
    this.currencyCode = currency === 'KHR' ? 116 : 840;
  }

  /**
   * Generate a KHQR payment QR code string
   */
  async generateQR(amount: number, billNumber?: string): Promise<{
    qrString: string;
    md5: string;
  }> {
    // Dynamically import bakong-khqr (ESM-only module)
    const { BakongKHQR, MerchantInfo } = await import('bakong-khqr');

    // Dynamic KHQR (with amount) requires an expiration timestamp
    // Use millisecond timestamp (13 digits): current time + 24 hours
    const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000;

    const merchantInfo = new MerchantInfo(
      this.bankAccount,
      this.merchantName,
      this.merchantCity,
      this.merchantId,
      this.acquiringBank,
      {
        amount,
        currency: this.currencyCode,
        expirationTimestamp,
        storeLabel: this.storeLabel,
        terminalLabel: 'POS Terminal',
        billNumber: billNumber || undefined,
      },
    );

    const khqrInstance = new BakongKHQR();
    const response = khqrInstance.generateMerchant(merchantInfo);

    if (response.status.code !== 0 || !response.data) {
      throw new HttpException(
        `KHQR generation failed: ${response.status.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      qrString: response.data.qr,
      md5: response.data.md5,
    };
  }
}
