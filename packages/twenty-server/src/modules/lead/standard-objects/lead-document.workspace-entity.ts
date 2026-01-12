import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export enum LeadDocumentCategory {
  SANCTION_LETTER = 'SANCTION_LETTER',
  REPAYMENT_SCHEDULE = 'REPAYMENT_SCHEDULE',
  CHEQUE_COPY = 'CHEQUE_COPY',
  SOA = 'SOA',
  CHEQUE_DEPOSIT_SLIP = 'CHEQUE_DEPOSIT_SLIP',
  AGREEMENT_COPY = 'AGREEMENT_COPY',
  OTHER = 'OTHER',
}

export class LeadDocumentWorkspaceEntity extends BaseWorkspaceEntity {
  // Document fields
  category: LeadDocumentCategory;
  fileUrl: string;
  caption: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
