import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class MachineryWorkspaceEntity extends BaseWorkspaceEntity {
  // Machinery fields
  brand: string | null;
  model: string | null;
  purchaseValue: number | null;
  purchaseYear: number | null; // Max 4 digits
  description: string | null; // Max 150 chars
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity> | null;
  leadId: string | null;
}
