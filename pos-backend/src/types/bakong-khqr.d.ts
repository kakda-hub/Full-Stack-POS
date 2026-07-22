/**
 * Type declarations for bakong-khqr (v1.0.20)
 *
 * KHQR is a Bakong/ABA KHQR payment QR code generation library.
 * The package is ESM-only, so it must be dynamically imported.
 */

declare module 'bakong-khqr' {
  /** Optional fields that can be set on IndividualInfo / MerchantInfo instances */
  export interface KHQROptionalFields {
    accountInformation?: string;
    acquiringBank?: string;
    currency?: number; // 840 = USD, 116 = KHR (numeric EMV codes)
    amount?: number;
    billNumber?: string;
    storeLabel?: string;
    terminalLabel?: string;
    mobileNumber?: string;
    purposeOfTransaction?: string;
    languagePreference?: string;
    merchantNameAlternateLanguage?: string;
    merchantCityAlternateLanguage?: string;
    upiMerchantAccount?: string;
    expirationTimestamp?: number; // Millisecond timestamp (13 digits)
    merchantCategoryCode?: string;
  }

  /** Status object from KHQR API responses */
  export interface KHQRStatus {
    code: number;
    errorCode?: number;
    message: string;
  }

  /** Data payload from a successful KHQR generation */
  export interface KHQRData {
    qr: string;
    md5: string;
  }

  /** Response from BakongKHQR generation/decoding methods */
  export interface KHQRResponse {
    status: KHQRStatus;
    data: KHQRData | null;
  }

  /** Individual KHQR info model (person-to-person) */
  export class IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      optional?: KHQROptionalFields,
    );

    bakongAccountID: string;
    accountInformation?: string;
    acquiringBank?: string;
    currency: number;
    amount?: number;
    merchantName: string;
    merchantCity: string;
    billNumber?: string;
    storeLabel?: string;
    terminalLabel?: string;
    mobileNumber?: string;
    purposeOfTransaction?: string;
    languagePreference?: string;
    merchantNameAlternateLanguage?: string;
    merchantCityAlternateLanguage?: string;
    upiMerchantAccount?: string;
    expirationTimestamp?: number;
    merchantCategoryCode?: string;
  }

  /** Merchant KHQR info model (retail payments, extends IndividualInfo) */
  export class MerchantInfo extends IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      merchantID: string,
      acquiringBank: string,
      optional?: KHQROptionalFields,
    );

    merchantID: string;
    acquiringBank: string;
  }

  /** Main KHQR controller class */
  export class BakongKHQR {
    constructor();

    /** Generate a merchant QR code (instance method) */
    generateMerchant(merchantInfo: MerchantInfo): KHQRResponse;

    /** Generate an individual QR code (instance method) */
    generateIndividual(individualInfo: IndividualInfo): KHQRResponse;

    /** Decode a KHQR string */
    static decode(khqrString: string): KHQRResponse;

    /** Decode a non-KHQR string */
    static decodeNonKhqr(khqrString: string): KHQRResponse;

    /** Verify a KHQR string (CRC check) */
    static verify(khqrString: string): { status: KHQRStatus; data: any };

    /** Generate a deep link for a QR code */
    static generateDeepLink(url: string, qr: string, sourceInfo: any): Promise<any>;

    /** Check if a Bakong account exists */
    static checkBakongAccount(url: string, bakongID: string): Promise<any>;
  }
}
