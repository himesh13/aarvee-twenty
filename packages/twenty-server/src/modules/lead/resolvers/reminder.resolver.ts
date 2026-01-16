import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import {
  Reminder,
  ReminderService,
  ReminderType,
} from 'src/modules/lead/services/reminder.service';

/**
 * Reminder Resolver
 * 
 * GraphQL resolver for reminder operations
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class ReminderResolver {
  constructor(private readonly reminderService: ReminderService) {}

  /**
   * Get upcoming birthday reminders
   */
  @Query(() => [Object])
  async getUpcomingBirthdayReminders(
    @AuthWorkspace() workspace: Workspace,
    @Args('daysAhead', { type: () => Number, nullable: true })
    daysAhead?: number,
  ): Promise<Reminder[]> {
    return this.reminderService.getUpcomingBirthdayReminders(
      workspace.id,
      daysAhead || 7,
    );
  }

  /**
   * Get loan topup reminders
   */
  @Query(() => [Object])
  async getLoanTopupReminders(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Reminder[]> {
    return this.reminderService.getLoanTopupReminders(workspace.id);
  }

  /**
   * Get all reminders for a lead
   */
  @Query(() => [Object])
  async getRemindersForLead(
    @AuthWorkspace() workspace: Workspace,
    @Args('leadId', { type: () => String }) leadId: string,
  ): Promise<Reminder[]> {
    return this.reminderService.getRemindersForLead(workspace.id, leadId);
  }

  /**
   * Create a custom reminder
   */
  @Mutation(() => Object)
  async createReminder(
    @AuthWorkspace() workspace: Workspace,
    @Args('leadId', { type: () => String }) leadId: string,
    @Args('title', { type: () => String }) title: string,
    @Args('dueDate', { type: () => Date }) dueDate: Date,
    @Args('description', { type: () => String, nullable: true })
    description?: string,
  ): Promise<Reminder> {
    return this.reminderService.createReminder(
      workspace.id,
      leadId,
      title,
      dueDate,
      description,
    );
  }

  /**
   * Mark a reminder as completed
   */
  @Mutation(() => Object)
  async completeReminder(
    @AuthWorkspace() workspace: Workspace,
    @Args('reminderId', { type: () => String }) reminderId: string,
  ): Promise<Reminder> {
    return this.reminderService.completeReminder(workspace.id, reminderId);
  }
}
