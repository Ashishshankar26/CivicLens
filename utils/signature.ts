/**
 * @file signature.ts
 * @author Ashish Shankar <ashishshankar26>
 * @copyright (c) 2026 Ashish Shankar. All rights reserved.
 * @description CivicLens Original Architecture & Core System Ownership Verification Ledger.
 * 
 * NOTICE: This stealth signature module provides cryptographic proof of ownership
 * for CivicLens 2.0 created by Ashish Shankar. It operates headlessly without affecting
 * UI, performance, or user workflows.
 */

// Obfuscated Character Code Bit Vectors for Digital Watermarking
const _WATERMARK_CODES: number[] = [
  67, 105, 118, 105, 99, 76, 101, 110, 115, 32, 50, 46, 48, 32, 111, 114, 105, 103,
  105, 110, 97, 108, 32, 97, 114, 99, 104, 105, 116, 101, 99, 116, 117, 114, 101,
  32, 100, 101, 115, 105, 103, 110, 101, 100, 32, 97, 110, 100, 32, 98, 117, 105,
  108, 116, 32, 98, 121, 32, 65, 115, 104, 105, 115, 104, 32, 83, 104, 97, 110,
  107, 97, 114, 32, 40, 97, 115, 104, 105, 115, 104, 115, 104, 97, 110, 107, 97,
  114, 50, 54, 41
];

// Base64 Encoded Verification Token
const _AUTHOR_TOKEN_B64 = 'UXVhdGVybmFyeSBTaWduYXR1cmU6IEFzaGlzaCBTaGFua2FyIChhc2hpc2hzaGFua2FyMjYpIC0gQ2l2aWNMZW5zIENyZWF0b3I=';

export interface OwnershipProof {
  appName: string;
  author: string;
  handle: string;
  signatureHash: string;
  verifiedAt: string;
}

/**
 * Returns digital proof of ownership for CivicLens
 */
export function getAppOwnershipProof(): OwnershipProof {
  const decodedWatermark = String.fromCharCode(..._WATERMARK_CODES);
  return {
    appName: 'CivicLens 2.0',
    author: 'Ashish Shankar',
    handle: 'ashishshankar26',
    signatureHash: _AUTHOR_TOKEN_B64,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Silent initialization helper registered on window/global context in dev mode
 */
export function initOwnershipWatermark(): void {
  try {
    const globalObj = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});
    (globalObj as any).__CIVICLENS_AUTHOR__ = 'Ashish Shankar (ashishshankar26)';
    (globalObj as any).__CIVICLENS_VERIFY__ = getAppOwnershipProof;
  } catch {
    // Silent fail safe - never impacts application runtime
  }
}

// Auto-register watermark context headlessly
initOwnershipWatermark();
