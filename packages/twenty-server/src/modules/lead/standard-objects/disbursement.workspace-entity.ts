import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export class DisbursementWorkspaceEntity extends BaseWorkspaceEntity {
  // Disbursement fields
  financer: string | null; // Link to CatalogFinancer
  loanType: string | null; // Link to CatalogLoanType
  accountNo: string | null;
  amount: number | null;
  roiPct: number | null;
  tenureMonths: number | null; // Max 3 digits
  processingFee: number | null;
  emi: number | null;
  preEmi: number | null;
  firstEmiDate: Date | null;
  lastEmiDate: Date | null;
  loanCoverInsurance: number | null;
  propertyInsurance: number | null;
  registerMortgage: boolean;
  registerMortgageExpense: number | null;
  otherExpenses: number | null;
  paymentDetails: string | null;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  lead: EntityRelation<LeadWorkspaceEntity>;
  leadId: string;
}
