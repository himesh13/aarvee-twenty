import { Module } from '@nestjs/common';

import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { LeadExportResolver } from 'src/modules/lead/resolvers/lead-export.resolver';
import { LeadResolver } from 'src/modules/lead/resolvers/lead.resolver';
import { ReminderResolver } from 'src/modules/lead/resolvers/reminder.resolver';
import { ComputedFieldsService } from 'src/modules/lead/services/computed-fields.service';
import { LeadDuplicationService } from 'src/modules/lead/services/lead-duplication.service';
import { LeadExportService } from 'src/modules/lead/services/lead-export.service';
import { LeadNumberGeneratorService } from 'src/modules/lead/services/lead-number-generator.service';
import { LeadValidationService } from 'src/modules/lead/services/lead-validation.service';
import { ReminderService } from 'src/modules/lead/services/reminder.service';

/**
 * Lead Module
 * 
 * Provides functionality for managing leads in the Lead Management System.
 * This module is designed to work with Twenty's metadata-driven architecture,
 * where CRUD operations are auto-generated from workspace entities.
 * 
 * The workspace entities are automatically discovered and registered by the
 * metadata system, so they don't need to be imported here.
 * 
 * This module provides additional business logic services:
 * - LeadNumberGeneratorService: Auto-generates unique lead numbers
 * - LeadDuplicationService: Duplicates leads with new lead numbers
 * - LeadValidationService: Validates lead data and business rules
 * - ComputedFieldsService: Calculates computed/derived fields
 * - ReminderService: Manages reminders (birthday, loan topup, custom)
 * - LeadExportService: Exports leads to PDF/Word formats
 * 
 * GraphQL Resolvers:
 * - LeadResolver: Custom mutations for lead operations (duplicate)
 * - ReminderResolver: Reminder queries and mutations
 * - LeadExportResolver: Export operations (PDF/Word)
 */
@Module({
  imports: [ActorModule, AuthModule, TwentyORMModule],
  providers: [
    LeadNumberGeneratorService,
    LeadDuplicationService,
    LeadValidationService,
    ComputedFieldsService,
    ReminderService,
    LeadExportService,
    LeadResolver,
    ReminderResolver,
    LeadExportResolver,
  ],
  exports: [
    LeadNumberGeneratorService,
    LeadDuplicationService,
    LeadValidationService,
    ComputedFieldsService,
    ReminderService,
    LeadExportService,
  ],
})
export class LeadModule {}
