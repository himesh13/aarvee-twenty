import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class LeadBusinessDetailWorkspaceEntity extends BaseWorkspaceEntity {
  // Business detail fields
  employmentType: string | null; // Link to CatalogEmploymentType
  industry: string | null; // Link to CatalogIndustry
  ownership: string | null; // Link to CatalogOwnership
  businessType: string | null; // Link to CatalogBusinessType
  constitution: string | null; // Link to CatalogConstitution
  yearsInBusiness: number | null;
  monthlyNetSalary: number | null;
  otherInfo: string | null; // Max 150 chars
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
