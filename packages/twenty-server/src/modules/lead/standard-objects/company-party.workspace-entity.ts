import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export enum CompanyPartyRole {
  APPLICANT = 'APPLICANT',
  CO_APPLICANT = 'CO_APPLICANT',
  GUARANTOR = 'GUARANTOR',
}

export class CompanyPartyWorkspaceEntity extends BaseWorkspaceEntity {
  // Company party fields
  role: CompanyPartyRole;
  name: string;
  pan: string | null;
  regNo: string | null;
  regType: string | null;
  contactNumbers: string | null; // JSON array of phone numbers with labels
  doi: Date | null; // Date of incorporation
  email: string | null;
  website: string | null;
  officeAddress: string | null;
  factoryAddress: string | null;
  factorySameAsOffice: boolean;
  premisesType: string | null;
  yearsOffice: number | null; // Max 3 digits
  yearsFactory: number | null; // Max 3 digits
  loginCode: string | null; // Link to CatalogLoginCode
  otherInfo: string | null; // Max 150 chars
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
