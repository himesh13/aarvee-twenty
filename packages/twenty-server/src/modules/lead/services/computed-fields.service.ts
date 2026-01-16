import { Injectable } from '@nestjs/common';

/**
 * Computed Fields Service
 * 
 * Provides calculation logic for computed/derived fields in the Lead Management System
 */
@Injectable()
export class ComputedFieldsService {
  /**
   * Calculate remaining tenure
   * Formula: remainingTenure = tenure - paidEmi
   * 
   * @param tenure Total loan tenure in months
   * @param paidEmi Number of EMIs already paid
   * @returns Remaining tenure in months
   */
  calculateRemainingTenure(tenure: number, paidEmi: number): number {
    if (!tenure || tenure <= 0) {
      return 0;
    }

    if (!paidEmi || paidEmi < 0) {
      return tenure;
    }

    const remaining = tenure - paidEmi;

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Calculate total payable amount
   * Formula: totalPayable = emi * tenure
   * 
   * @param emi EMI amount
   * @param tenure Total loan tenure in months
   * @returns Total payable amount
   */
  calculateTotalPayable(emi: number, tenure: number): number {
    if (!emi || emi <= 0 || !tenure || tenure <= 0) {
      return 0;
    }

    return emi * tenure;
  }

  /**
   * Calculate remaining payable amount
   * Formula: remainingPayable = emi * remainingTenure
   * 
   * @param emi EMI amount
   * @param tenure Total loan tenure in months
   * @param paidEmi Number of EMIs already paid
   * @returns Remaining payable amount
   */
  calculateRemainingPayable(
    emi: number,
    tenure: number,
    paidEmi: number,
  ): number {
    const remainingTenure = this.calculateRemainingTenure(tenure, paidEmi);

    if (!emi || emi <= 0 || remainingTenure <= 0) {
      return 0;
    }

    return emi * remainingTenure;
  }

  /**
   * Calculate EMI using flat rate formula
   * Formula: EMI = (P + (P * R * T / 100)) / (T * 12)
   * where P = principal, R = rate of interest, T = tenure in years
   * 
   * @param principal Loan principal amount
   * @param rateOfInterest Annual rate of interest (percentage)
   * @param tenureMonths Tenure in months
   * @returns EMI amount
   */
  calculateEMIFlatRate(
    principal: number,
    rateOfInterest: number,
    tenureMonths: number,
  ): number {
    if (
      !principal ||
      principal <= 0 ||
      !rateOfInterest ||
      rateOfInterest < 0 ||
      !tenureMonths ||
      tenureMonths <= 0
    ) {
      return 0;
    }

    const tenureYears = tenureMonths / 12;
    const totalInterest = (principal * rateOfInterest * tenureYears) / 100;
    const totalAmount = principal + totalInterest;
    const emi = totalAmount / tenureMonths;

    return Math.round(emi * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate EMI using reducing balance formula
   * Formula: EMI = [P * R * (1 + R)^N] / [(1 + R)^N - 1]
   * where P = principal, R = monthly rate of interest, N = tenure in months
   * 
   * @param principal Loan principal amount
   * @param rateOfInterest Annual rate of interest (percentage)
   * @param tenureMonths Tenure in months
   * @returns EMI amount
   */
  calculateEMIReducingBalance(
    principal: number,
    rateOfInterest: number,
    tenureMonths: number,
  ): number {
    if (
      !principal ||
      principal <= 0 ||
      !rateOfInterest ||
      rateOfInterest < 0 ||
      !tenureMonths ||
      tenureMonths <= 0
    ) {
      return 0;
    }

    const monthlyRate = rateOfInterest / 12 / 100;
    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
    const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
    const emi = numerator / denominator;

    return Math.round(emi * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate age from date of birth
   * 
   * @param dateOfBirth Date of birth
   * @returns Age in years
   */
  calculateAge(dateOfBirth: Date): number {
    if (!dateOfBirth) {
      return 0;
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Calculate years at address/business
   * 
   * @param startDate Start date
   * @returns Years (with decimal precision)
   */
  calculateYears(startDate: Date): number {
    if (!startDate) {
      return 0;
    }

    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = diffDays / 365.25;

    return Math.round(years * 10) / 10; // Round to 1 decimal place
  }
}
