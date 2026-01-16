import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class VehicleWorkspaceEntity extends BaseWorkspaceEntity {
  // Vehicle fields
  brand: string | null;
  model: string | null;
  subModel: string | null;
  mfgYear: number | null; // Max 4 digits
  insuranceValidity: Date | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity> | null;
  leadId: string | null;
}
