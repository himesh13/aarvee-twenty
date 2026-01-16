import {
  type ActorMetadata,
  type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class LeadNoteWorkspaceEntity extends BaseWorkspaceEntity {
  // Note fields
  body: RichTextV2Metadata | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity> | null;
  leadId: string | null;
}
