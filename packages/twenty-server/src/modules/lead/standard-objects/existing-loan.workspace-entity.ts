import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class ExistingLoanWorkspaceEntity extends BaseWorkspaceEntity {
  // Existing loan fields
  financer: string | null; // Link to CatalogFinancer
  loanType: string | null; // Link to CatalogLoanType
  tenureMonths: number | null; // Max 3 digits
  paidEmiMonths: number | null; // Max 3 digits
  emiAmount: number | null;
  remainingTenure: number | null; // Computed: tenureMonths - paidEmiMonths
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity> | null;
  leadId: string | null;
}
