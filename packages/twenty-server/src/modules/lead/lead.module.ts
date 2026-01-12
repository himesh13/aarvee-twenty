import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';
import { LeadNumberGeneratorService } from 'src/modules/lead/services/lead-number-generator.service';

/**
 * Lead Module
 * 
 * Provides functionality for managing leads in the Lead Management System.
 * This includes:
 * - Lead CRUD operations (handled by metadata system)
 * - Lead number generation
 * - Lead business logic and validation
 * 
 * The module is designed to work with Twenty's metadata-driven architecture,
 * where most CRUD operations are auto-generated from workspace entities.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LeadWorkspaceEntity], 'metadata'),
  ],
  providers: [
    LeadNumberGeneratorService,
  ],
  exports: [
    LeadNumberGeneratorService,
  ],
})
export class LeadModule {}
