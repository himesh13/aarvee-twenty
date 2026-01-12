import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

/**
 * Service for generating unique Lead numbers in the format: LD-YYYYMM-#####
 * 
 * Format breakdown:
 * - LD: Prefix for Lead
 * - YYYYMM: Year and month (e.g., 202601 for January 2026)
 * - #####: 5-digit sequential number within the month
 * 
 * Examples:
 * - LD-202601-00001 (First lead of January 2026)
 * - LD-202601-00123 (123rd lead of January 2026)
 * - LD-202602-00001 (First lead of February 2026)
 */
@Injectable()
export class LeadNumberGeneratorService {
  private static readonly PREFIX = 'LD';
  private static readonly SEQUENCE_LENGTH = 5;

  constructor(
    @InjectRepository(LeadWorkspaceEntity, 'metadata')
    private readonly leadRepository: Repository<LeadWorkspaceEntity>,
  ) {}

  /**
   * Generates the next available Lead number for the current month
   * 
   * @param workspaceId - The workspace ID to generate the lead number for
   * @returns Promise<string> - The generated lead number (e.g., "LD-202601-00001")
   */
  async generateLeadNumber(workspaceId: string): Promise<string> {
    const now = new Date();
    const yearMonth = this.formatYearMonth(now);
    const monthPrefix = `${LeadNumberGeneratorService.PREFIX}-${yearMonth}`;

    // Get the count of leads created in the current month
    const count = await this.getLeadCountForMonth(workspaceId, monthPrefix);

    // Generate the next sequence number
    const sequenceNumber = (count + 1)
      .toString()
      .padStart(LeadNumberGeneratorService.SEQUENCE_LENGTH, '0');

    return `${monthPrefix}-${sequenceNumber}`;
  }

  /**
   * Validates that a lead number follows the correct format
   * 
   * @param leadNo - The lead number to validate
   * @returns boolean - True if the format is valid
   */
  validateLeadNumberFormat(leadNo: string): boolean {
    const pattern = /^LD-\d{6}-\d{5}$/;
    return pattern.test(leadNo);
  }

  /**
   * Parses a lead number and extracts its components
   * 
   * @param leadNo - The lead number to parse
   * @returns Object with prefix, year, month, and sequence
   */
  parseLeadNumber(leadNo: string): {
    prefix: string;
    year: number;
    month: number;
    sequence: number;
  } | null {
    if (!this.validateLeadNumberFormat(leadNo)) {
      return null;
    }

    const parts = leadNo.split('-');
    const yearMonth = parts[1];
    const sequence = parts[2];

    return {
      prefix: parts[0],
      year: parseInt(yearMonth.substring(0, 4), 10),
      month: parseInt(yearMonth.substring(4, 6), 10),
      sequence: parseInt(sequence, 10),
    };
  }

  /**
   * Formats a Date into YYYYMM format
   * 
   * @private
   * @param date - The date to format
   * @returns string - The formatted year-month string
   */
  private formatYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  }

  /**
   * Gets the count of leads with numbers starting with the given prefix
   * 
   * @private
   * @param workspaceId - The workspace ID
   * @param monthPrefix - The month prefix (e.g., "LD-202601")
   * @returns Promise<number> - The count of matching leads
   */
  private async getLeadCountForMonth(
    workspaceId: string,
    monthPrefix: string,
  ): Promise<number> {
    const count = await this.leadRepository.count({
      where: {
        workspaceId,
        leadNo: {
          startsWith: monthPrefix,
        } as any,
      },
    });

    return count;
  }

  /**
   * Ensures a lead number is unique within the workspace
   * 
   * @param workspaceId - The workspace ID
   * @param leadNo - The lead number to check
   * @returns Promise<boolean> - True if the lead number is unique
   */
  async isLeadNumberUnique(
    workspaceId: string,
    leadNo: string,
  ): Promise<boolean> {
    const count = await this.leadRepository.count({
      where: {
        workspaceId,
        leadNo,
      },
    });

    return count === 0;
  }

  /**
   * Generates a unique lead number, retrying if there are conflicts
   * This method handles race conditions by regenerating if a conflict is detected
   * 
   * @param workspaceId - The workspace ID
   * @param maxRetries - Maximum number of retries (default: 5)
   * @returns Promise<string> - A unique lead number
   * @throws Error if unable to generate a unique number after max retries
   */
  async generateUniqueLeadNumber(
    workspaceId: string,
    maxRetries = 5,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const leadNo = await this.generateLeadNumber(workspaceId);

      if (await this.isLeadNumberUnique(workspaceId, leadNo)) {
        return leadNo;
      }

      // Small delay before retry to reduce race condition likelihood
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(
      `Failed to generate unique lead number after ${maxRetries} attempts`,
    );
  }
}
