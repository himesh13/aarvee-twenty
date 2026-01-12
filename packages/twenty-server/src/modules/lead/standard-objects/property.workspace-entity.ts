import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class PropertyWorkspaceEntity extends BaseWorkspaceEntity {
  // Property fields
  type: string | null; // Link to CatalogPropertyType
  isNewPurchase: boolean;
  isBuilderPurchase: boolean;
  readyPossession: boolean;
  classification: string | null; // Link to CatalogPropertyClassification
  value: number | null;
  saleDeedValue: number | null;
  area: number | null;
  areaUnit: string | null; // Link to CatalogAreaUnit
  ageYears: number | null; // Max 3 digits
  address: string | null; // Max 50 words
  otherInfo: string | null; // Max 200 chars
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
