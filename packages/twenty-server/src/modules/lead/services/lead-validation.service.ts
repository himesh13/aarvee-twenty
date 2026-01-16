import { Injectable } from '@nestjs/common';

/**
 * Lead Validation Service
 * 
 * Provides validation logic for lead data including:
 * - Required field validation
 * - Format validation (phone, PAN, Aadhar)
 * - Business rule validation
 */
@Injectable()
export class LeadValidationService {
  /**
   * Validates phone number format
   * Supports formats: +91-XXXXXXXXXX, XXXXXXXXXX
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) {
      return false;
    }

    // Remove spaces and dashes
    const cleaned = phoneNumber.replace(/[\s-]/g, '');

    // Check for Indian phone number format
    // Supports: +91XXXXXXXXXX or XXXXXXXXXX (10 digits)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

    return phoneRegex.test(cleaned);
  }

  /**
   * Validates PAN (Permanent Account Number) format
   * Format: AAAAA9999A (5 letters, 4 digits, 1 letter)
   */
  validatePAN(pan: string): boolean {
    if (!pan) {
      return false;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    return panRegex.test(pan.toUpperCase());
  }

  /**
   * Validates Aadhar number format
   * Format: 12 digits
   */
  validateAadhar(aadhar: string): boolean {
    if (!aadhar) {
      return false;
    }

    // Remove spaces and dashes
    const cleaned = aadhar.replace(/[\s-]/g, '');

    // Check for 12 digits
    const aadharRegex = /^\d{12}$/;

    return aadharRegex.test(cleaned);
  }

  /**
   * Validates email format
   */
  validateEmail(email: string): boolean {
    if (!email) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  /**
   * Validates required fields for lead creation
   */
  validateRequiredFields(leadData: {
    customerName?: string;
    contactNumber?: string;
    productId?: string;
    loanAmountRequired?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!leadData.customerName || leadData.customerName.trim() === '') {
      errors.push('Customer name is required');
    }

    if (!leadData.contactNumber || leadData.contactNumber.trim() === '') {
      errors.push('Contact number is required');
    } else if (!this.validatePhoneNumber(leadData.contactNumber)) {
      errors.push('Invalid phone number format');
    }

    if (!leadData.productId) {
      errors.push('Product is required');
    }

    if (!leadData.loanAmountRequired || leadData.loanAmountRequired <= 0) {
      errors.push('Loan amount must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates business rules
   */
  validateBusinessRules(leadData: {
    loanAmountRequired?: number;
    tenure?: number;
    paidEmi?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate loan amount is positive
    if (leadData.loanAmountRequired && leadData.loanAmountRequired <= 0) {
      errors.push('Loan amount must be greater than 0');
    }

    // Validate tenure is positive
    if (leadData.tenure && leadData.tenure <= 0) {
      errors.push('Tenure must be greater than 0');
    }

    // Validate paid EMI is not greater than tenure
    if (
      leadData.tenure &&
      leadData.paidEmi &&
      leadData.paidEmi > leadData.tenure
    ) {
      errors.push('Paid EMI cannot be greater than tenure');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
