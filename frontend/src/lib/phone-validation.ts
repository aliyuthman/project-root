import { NETWORK_CONFIG } from './config';

export type Network = typeof NETWORK_CONFIG.supportedNetworks[number];

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  detectedNetwork?: Network;
  normalizedPhone?: string;
}

/**
 * Comprehensive Nigerian phone number validation utility
 * Supports various input formats and detects network automatically
 */
export class NigerianPhoneValidator {
  
  /**
   * Get all valid prefixes across all networks
   */
  static getAllValidPrefixes(): string[] {
    return Object.values(NETWORK_CONFIG.prefixes).flat();
  }

  /**
   * Detect network from phone number prefix
   */
  static detectNetwork(phone: string): Network | null {
    const normalized = this.normalizePhoneNumber(phone);
    if (!normalized || normalized.length < 4) return null;
    
    const prefix = normalized.slice(0, 4);
    
    for (const [network, prefixes] of Object.entries(NETWORK_CONFIG.prefixes)) {
      if (prefixes.includes(prefix)) {
        return network as Network;
      }
    }
    
    return null;
  }

  /**
   * Normalize phone number to standard Nigerian format (11 digits starting with 0)
   */
  static normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Handle different input formats
    if (cleanPhone.startsWith('234')) {
      // +234xxxxxxxxx or 234xxxxxxxxx format
      const localNumber = cleanPhone.slice(3);
      if (localNumber.length === 10) {
        return '0' + localNumber;
      }
    } else if (cleanPhone.startsWith('0')) {
      // 0xxxxxxxxxx format (standard Nigerian)
      if (cleanPhone.length === 11) {
        return cleanPhone;
      }
    } else if (cleanPhone.length === 10) {
      // xxxxxxxxxx format (without country code or leading 0)
      return '0' + cleanPhone;
    }
    
    return null;
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    const normalized = this.normalizePhoneNumber(phone);
    if (!normalized) return phone;
    
    // Format as 0803 123 4567
    return normalized.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  /**
   * Validate Nigerian phone number
   */
  static validatePhone(phone: string, requiredNetwork?: Network): PhoneValidationResult {
    if (!phone || !phone.trim()) {
      return {
        isValid: false,
        error: 'Phone number is required'
      };
    }

    // Normalize phone number
    const normalized = this.normalizePhoneNumber(phone.trim());
    if (!normalized) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Use 0803XXXXXXX or 803XXXXXXX format'
      };
    }

    // Check length
    if (normalized.length !== 11) {
      return {
        isValid: false,
        error: 'Phone number must be 11 digits (e.g., 08012345678)'
      };
    }

    // Check if starts with 0
    if (!normalized.startsWith('0')) {
      return {
        isValid: false,
        error: 'Phone number must start with 0'
      };
    }

    // Detect network
    const detectedNetwork = this.detectNetwork(normalized);
    if (!detectedNetwork) {
      const validPrefixes = this.getAllValidPrefixes();
      return {
        isValid: false,
        error: `Invalid network prefix. Valid prefixes: ${validPrefixes.slice(0, 10).join(', ')}${validPrefixes.length > 10 ? '...' : ''}`
      };
    }

    // Check if matches required network (if specified)
    if (requiredNetwork && detectedNetwork !== requiredNetwork) {
      const networkPrefixes = NETWORK_CONFIG.prefixes[requiredNetwork];
      return {
        isValid: false,
        error: `This number belongs to ${detectedNetwork.toUpperCase()}, but you selected ${requiredNetwork.toUpperCase()}. Valid ${requiredNetwork.toUpperCase()} prefixes: ${networkPrefixes.join(', ')}`
      };
    }

    return {
      isValid: true,
      detectedNetwork,
      normalizedPhone: normalized
    };
  }

  /**
   * Check if phone number belongs to specific network
   */
  static belongsToNetwork(phone: string, network: Network): boolean {
    const result = this.validatePhone(phone, network);
    return result.isValid && result.detectedNetwork === network;
  }

  /**
   * Get network name display
   */
  static getNetworkDisplay(network: Network): string {
    const displays = {
      mtn: 'MTN',
      airtel: 'Airtel',
      glo: 'Glo',
      '9mobile': '9mobile'
    };
    return displays[network] || network.toUpperCase();
  }

  /**
   * Auto-detect network and suggest correction
   */
  static suggestNetworkCorrection(phone: string, intendedNetwork: Network): string | null {
    const detectedNetwork = this.detectNetwork(phone);
    if (!detectedNetwork || detectedNetwork === intendedNetwork) {
      return null;
    }
    
    return `This number appears to be a ${this.getNetworkDisplay(detectedNetwork)} number, not ${this.getNetworkDisplay(intendedNetwork)}. Would you like to switch to ${this.getNetworkDisplay(detectedNetwork)}?`;
  }
}

// Export convenience functions
export const validateNigerianPhone = NigerianPhoneValidator.validatePhone;
export const detectPhoneNetwork = NigerianPhoneValidator.detectNetwork;
export const formatNigerianPhone = NigerianPhoneValidator.formatPhoneNumber;
export const normalizeNigerianPhone = NigerianPhoneValidator.normalizePhoneNumber;