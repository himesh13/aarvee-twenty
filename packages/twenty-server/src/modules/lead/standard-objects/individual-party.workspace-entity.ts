import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export enum IndividualPartyRole {
  APPLICANT = 'APPLICANT',
  CO_APPLICANT = 'CO_APPLICANT',
  GUARANTOR = 'GUARANTOR',
}

export class IndividualPartyWorkspaceEntity extends BaseWorkspaceEntity {
  // Individual party fields
  role: IndividualPartyRole;
  name: string;
  contactNumbers: string | null; // JSON array of phone numbers with labels
  email: string | null;
  dob: Date | null;
  maritalStatus: string | null; // Link to CatalogMaritalStatus
  gender: string | null;
  residenceType: string | null;
  residenceAddress: string | null;
  permanentAddress: string | null;
  permSameAsRes: boolean;
  motherMaidenName: string | null;
  pan: string | null;
  aadhar: string | null;
  education: string | null;
  businessDetails: string | null;
  yearsOnResidence: number | null; // Max 3 digits
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
