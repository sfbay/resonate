/**
 * City Systems Integration Layer
 *
 * This module provides stubs for integration with San Francisco city systems.
 * Currently a placeholder - to be implemented when API access is available.
 *
 * Potential integration points:
 * 1. Vendor Registration System - Verify/register publishers as city vendors
 * 2. Procurement System - Generate purchase orders, track payments
 * 3. Department Directory - Validate department codes and contacts
 */

import type { CityVendorRecord, CityPurchaseOrder, Publisher, Order } from '@/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

interface CityIntegrationConfig {
  enabled: boolean;
  vendorApiUrl?: string;
  procurementApiUrl?: string;
  apiKey?: string;
}

const config: CityIntegrationConfig = {
  enabled: false, // Set to true when integration is ready
  vendorApiUrl: process.env.CITY_VENDOR_API_URL,
  procurementApiUrl: process.env.CITY_PROCUREMENT_API_URL,
  apiKey: process.env.CITY_API_KEY,
};

// =============================================================================
// VENDOR SYSTEM INTEGRATION
// =============================================================================

/**
 * Check if a publisher is a registered city vendor
 */
export async function checkVendorStatus(
  taxId: string
): Promise<CityVendorRecord | null> {
  if (!config.enabled) {
    console.log('[CityIntegration] Vendor check skipped - integration disabled');
    return null;
  }

  // TODO: Implement actual API call
  // Example:
  // const response = await fetch(`${config.vendorApiUrl}/vendors/${taxId}`, {
  //   headers: { 'Authorization': `Bearer ${config.apiKey}` }
  // });
  // return response.json();

  throw new Error('City vendor integration not yet implemented');
}

/**
 * Get vendor registration URL/instructions for a publisher
 */
export function getVendorRegistrationInfo(): {
  url: string;
  instructions: string;
} {
  return {
    url: 'https://sfgov.org/oca/supplier-registration',
    instructions: `
      To receive payments from City departments, you must register as a City supplier:

      1. Visit the SF Supplier Portal
      2. Create an account or sign in
      3. Complete the Supplier Registration form
      4. Upload required documents (W-9, business license, etc.)
      5. Wait for approval (typically 5-10 business days)

      Once approved, enter your Vendor ID in your Resonate profile.
    `.trim(),
  };
}

/**
 * Validate a vendor ID against city records
 */
export async function validateVendorId(
  vendorId: string
): Promise<{ valid: boolean; record?: CityVendorRecord; error?: string }> {
  if (!config.enabled) {
    // In development/demo mode, accept any vendor ID format
    const isValidFormat = /^[A-Z0-9]{6,12}$/.test(vendorId);
    return {
      valid: isValidFormat,
      error: isValidFormat ? undefined : 'Invalid vendor ID format',
    };
  }

  // TODO: Implement actual validation
  throw new Error('City vendor validation not yet implemented');
}

// =============================================================================
// PROCUREMENT SYSTEM INTEGRATION
// =============================================================================

/**
 * Generate a purchase order for an approved order
 */
export async function generatePurchaseOrder(
  order: Order,
  publisher: Publisher,
  departmentCode: string
): Promise<CityPurchaseOrder | null> {
  if (!config.enabled) {
    console.log('[CityIntegration] PO generation skipped - integration disabled');

    // Return a mock PO for development
    return {
      poNumber: `PO-${Date.now()}-DEMO`,
      vendorId: publisher.vendorId || 'DEMO-VENDOR',
      departmentCode,
      amount: order.total,
      description: `Resonate Campaign Order #${order.id}`,
      createdAt: new Date(),
    };
  }

  // TODO: Implement actual PO generation
  // This would likely involve:
  // 1. Validating the order is approved
  // 2. Confirming vendor is active
  // 3. Creating a requisition in the city system
  // 4. Getting back a PO number

  throw new Error('City procurement integration not yet implemented');
}

/**
 * Check payment status for a purchase order
 */
export async function checkPaymentStatus(
  poNumber: string
): Promise<{ status: 'pending' | 'processing' | 'paid'; paidDate?: Date }> {
  if (!config.enabled) {
    return { status: 'pending' };
  }

  // TODO: Implement actual payment status check
  throw new Error('City payment status check not yet implemented');
}

// =============================================================================
// DEPARTMENT VALIDATION
// =============================================================================

/**
 * Validate a department code
 */
export async function validateDepartmentCode(
  code: string
): Promise<{ valid: boolean; departmentName?: string }> {
  // Known SF department codes (partial list for validation)
  const knownDepartments: Record<string, string> = {
    'DPH': 'Department of Public Health',
    'DEM': 'Department of Emergency Management',
    'RPD': 'Recreation and Parks Department',
    'OEWD': 'Office of Economic and Workforce Development',
    'MOHCD': 'Mayor\'s Office of Housing and Community Development',
    'SFMTA': 'San Francisco Municipal Transportation Agency',
    'DPW': 'Department of Public Works',
    'SFPD': 'San Francisco Police Department',
    'SFFD': 'San Francisco Fire Department',
    'HSA': 'Human Services Agency',
    'DCYF': 'Department of Children, Youth & Their Families',
    'SFPL': 'San Francisco Public Library',
    'ASR': 'Office of Assessor-Recorder',
    'ENV': 'Department of the Environment',
  };

  const upperCode = code.toUpperCase();
  if (knownDepartments[upperCode]) {
    return { valid: true, departmentName: knownDepartments[upperCode] };
  }

  // If integration is enabled, check against live system
  if (config.enabled) {
    // TODO: Implement actual department validation
  }

  return { valid: false };
}

// =============================================================================
// INTEGRATION STATUS
// =============================================================================

/**
 * Check if city integration is available
 */
export function getIntegrationStatus(): {
  enabled: boolean;
  services: {
    vendor: 'available' | 'unavailable' | 'demo';
    procurement: 'available' | 'unavailable' | 'demo';
    department: 'available' | 'unavailable' | 'demo';
  };
} {
  if (!config.enabled) {
    return {
      enabled: false,
      services: {
        vendor: 'demo',
        procurement: 'demo',
        department: 'demo',
      },
    };
  }

  return {
    enabled: true,
    services: {
      vendor: config.vendorApiUrl ? 'available' : 'unavailable',
      procurement: config.procurementApiUrl ? 'available' : 'unavailable',
      department: 'available', // Using hardcoded list as fallback
    },
  };
}
