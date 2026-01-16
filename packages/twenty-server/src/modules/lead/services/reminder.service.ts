import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export enum ReminderType {
  BIRTHDAY = 'BIRTHDAY',
  LOAN_TOPUP = 'LOAN_TOPUP',
  FOLLOW_UP = 'FOLLOW_UP',
  CUSTOM = 'CUSTOM',
}

export interface Reminder {
  id: string;
  type: ReminderType;
  leadId: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  createdAt: Date;
}

/**
 * Reminder Service
 * 
 * Manages reminders for leads including:
 * - Birthday reminders for individual parties
 * - 12-month loan topup reminders for disbursed leads
 * - Custom follow-up reminders
 */
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Get upcoming birthday reminders
   * Checks individual parties associated with leads for birthdays in the next N days
   * 
   * @param workspaceId Workspace ID
   * @param daysAhead Number of days to look ahead (default: 7)
   * @returns Array of birthday reminders
   */
  async getUpcomingBirthdayReminders(
    workspaceId: string,
    daysAhead: number = 7,
  ): Promise<Reminder[]> {
    try {
      // In a full implementation, this would query IndividualParty entities
      // and check their dateOfBirth fields against current date
      // For now, returning a structure that matches the expected format
      
      this.logger.log(
        `Getting birthday reminders for workspace ${workspaceId}, ${daysAhead} days ahead`,
      );

      // TODO: Implement actual database query
      // const individualPartyRepository = await this.globalWorkspaceOrmManager.getRepository(
      //   workspaceId,
      //   'individualParty',
      // );
      
      // Query for individuals with birthdays in the next N days
      // Convert to Reminder format

      return [];
    } catch (error) {
      this.logger.error(
        `Failed to get birthday reminders: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get loan topup reminders
   * Finds leads that were disbursed approximately 12 months ago
   * 
   * @param workspaceId Workspace ID
   * @returns Array of loan topup reminders
   */
  async getLoanTopupReminders(workspaceId: string): Promise<Reminder[]> {
    try {
      this.logger.log(
        `Getting loan topup reminders for workspace ${workspaceId}`,
      );

      // Calculate date 12 months ago (with a window of ±1 month)
      const now = new Date();
      const elevenMonthsAgo = new Date(now);
      elevenMonthsAgo.setMonth(now.getMonth() - 11);
      
      const thirteenMonthsAgo = new Date(now);
      thirteenMonthsAgo.setMonth(now.getMonth() - 13);

      // TODO: Implement actual database query
      // const disbursementRepository = await this.globalWorkspaceOrmManager.getRepository(
      //   workspaceId,
      //   'disbursement',
      // );
      
      // Query for disbursements created 11-13 months ago
      // Join with leads to get lead details
      // Convert to Reminder format

      return [];
    } catch (error) {
      this.logger.error(
        `Failed to get loan topup reminders: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a custom reminder for a lead
   * 
   * @param workspaceId Workspace ID
   * @param leadId Lead ID
   * @param title Reminder title
   * @param dueDate Due date
   * @param description Optional description
   * @returns Created reminder
   */
  async createReminder(
    workspaceId: string,
    leadId: string,
    title: string,
    dueDate: Date,
    description?: string,
  ): Promise<Reminder> {
    try {
      // Verify lead exists
      const leadRepository =
        await this.globalWorkspaceOrmManager.getRepository<LeadWorkspaceEntity>(
          workspaceId,
          'lead',
        );

      const lead = await leadRepository.findOne({
        where: { id: leadId },
      });

      if (!isDefined(lead)) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // TODO: Implement actual reminder storage
      // For now, using Twenty's built-in task system would be appropriate
      // Create a task linked to the lead with the reminder details

      const reminder: Reminder = {
        id: `reminder-${Date.now()}`,
        type: ReminderType.CUSTOM,
        leadId,
        title,
        description,
        dueDate,
        isCompleted: false,
        createdAt: new Date(),
      };

      this.logger.log(`Created reminder: ${reminder.id} for lead: ${leadId}`);

      return reminder;
    } catch (error) {
      this.logger.error(
        `Failed to create reminder: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all reminders for a lead
   * 
   * @param workspaceId Workspace ID
   * @param leadId Lead ID
   * @returns Array of reminders for the lead
   */
  async getRemindersForLead(
    workspaceId: string,
    leadId: string,
  ): Promise<Reminder[]> {
    try {
      // TODO: Implement actual query
      // Query tasks/reminders associated with this lead
      // Return in Reminder format

      this.logger.log(`Getting reminders for lead: ${leadId}`);

      return [];
    } catch (error) {
      this.logger.error(
        `Failed to get reminders for lead: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mark a reminder as completed
   * 
   * @param workspaceId Workspace ID
   * @param reminderId Reminder ID
   * @returns Updated reminder
   */
  async completeReminder(
    workspaceId: string,
    reminderId: string,
  ): Promise<Reminder> {
    try {
      // TODO: Implement actual update
      // Update the reminder/task to mark as completed

      this.logger.log(`Completed reminder: ${reminderId}`);

      return {
        id: reminderId,
        type: ReminderType.CUSTOM,
        leadId: '',
        title: '',
        dueDate: new Date(),
        isCompleted: true,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to complete reminder: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
