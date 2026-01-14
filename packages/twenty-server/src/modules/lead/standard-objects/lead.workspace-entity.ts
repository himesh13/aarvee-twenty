import {
  type ActorMetadata,
  FieldMetadataType,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { type CompanyPartyWorkspaceEntity } from 'src/modules/lead/standard-objects/company-party.workspace-entity';
import { type IndividualPartyWorkspaceEntity } from 'src/modules/lead/standard-objects/individual-party.workspace-entity';
import { type PropertyWorkspaceEntity } from 'src/modules/lead/standard-objects/property.workspace-entity';
import { type VehicleWorkspaceEntity } from 'src/modules/lead/standard-objects/vehicle.workspace-entity';
import { type MachineryWorkspaceEntity } from 'src/modules/lead/standard-objects/machinery.workspace-entity';
import { type ExistingLoanWorkspaceEntity } from 'src/modules/lead/standard-objects/existing-loan.workspace-entity';
import { type ReferenceWorkspaceEntity } from 'src/modules/lead/standard-objects/reference.workspace-entity';
import { type DisbursementWorkspaceEntity } from 'src/modules/lead/standard-objects/disbursement.workspace-entity';
import { type LeadNoteWorkspaceEntity } from 'src/modules/lead/standard-objects/lead-note.workspace-entity';
import { type LeadDocumentWorkspaceEntity } from 'src/modules/lead/standard-objects/lead-document.workspace-entity';
import { type LeadBusinessDetailWorkspaceEntity } from 'src/modules/lead/standard-objects/lead-business-detail.workspace-entity';

const LEAD_NO_FIELD_NAME = 'leadNo';
const CUSTOMER_NAME_FIELD_NAME = 'customerName';
const CONTACT_NUMBER_FIELD_NAME = 'contactNumber';
const SHORT_DESCRIPTION_FIELD_NAME = 'shortDescription';

export const SEARCH_FIELDS_FOR_LEAD: FieldTypeAndNameMetadata[] = [
  { name: LEAD_NO_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: CUSTOMER_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: CONTACT_NUMBER_FIELD_NAME, type: FieldMetadataType.PHONES },
  { name: SHORT_DESCRIPTION_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class LeadWorkspaceEntity extends BaseWorkspaceEntity {
  // Lead-specific fields
  leadNo: string;
  customerName: string | null;
  contactNumber: PhonesMetadata;
  product: string | null; // Link to CatalogProduct
  loanAmount: number | null;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  referredBy: string | null;
  shortDescription: string | null;
  status: string | null; // Link to CatalogStatus
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;

  // Relations to standard Twenty objects
  assignedTo: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assignedToId: string | null;
  taskTargets: EntityRelation<TaskTargetWorkspaceEntity[]>;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;

  // Relations to Lead child objects
  companyParties: EntityRelation<CompanyPartyWorkspaceEntity[]>;
  individualParties: EntityRelation<IndividualPartyWorkspaceEntity[]>;
  properties: EntityRelation<PropertyWorkspaceEntity[]>;
  vehicles: EntityRelation<VehicleWorkspaceEntity[]>;
  machineries: EntityRelation<MachineryWorkspaceEntity[]>;
  existingLoans: EntityRelation<ExistingLoanWorkspaceEntity[]>;
  references: EntityRelation<ReferenceWorkspaceEntity[]>;
  disbursements: EntityRelation<DisbursementWorkspaceEntity[]>;
  leadNotes: EntityRelation<LeadNoteWorkspaceEntity[]>;
  leadDocuments: EntityRelation<LeadDocumentWorkspaceEntity[]>;
  leadBusinessDetail: EntityRelation<LeadBusinessDetailWorkspaceEntity> | null;
}
