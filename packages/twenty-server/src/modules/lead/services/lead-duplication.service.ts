import { Injectable, Logger } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { DuplicatedLeadDTO } from 'src/modules/lead/dtos/duplicated-lead.dto';
import {
  LeadException,
  LeadExceptionCode,
  LeadExceptionMessageKey,
  generateLeadExceptionMessage,
} from 'src/modules/lead/exceptions/lead.exception';
import { LeadNumberGeneratorService } from 'src/modules/lead/services/lead-number-generator.service';
import { LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

@Injectable()
export class LeadDuplicationService {
  private readonly logger = new Logger(LeadDuplicationService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
    private readonly leadNumberGeneratorService: LeadNumberGeneratorService,
  ) {}

  async duplicateLead(
    leadId: string,
    authContext: AuthContext,
  ): Promise<DuplicatedLeadDTO> {
    const { workspace } = authContext;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const workspaceId = workspace.id;

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext as WorkspaceAuthContext,
      async () => {
        const leadRepository =
          await this.globalWorkspaceOrmManager.getRepository<LeadWorkspaceEntity>(
            workspaceId,
            'lead',
            { shouldBypassPermissionChecks: true },
          );

        const originalLead = await leadRepository.findOne({
          where: { id: leadId },
        });

        if (!isDefined(originalLead)) {
          throw new LeadException(
            generateLeadExceptionMessage(
              LeadExceptionMessageKey.LEAD_NOT_FOUND,
              leadId,
            ),
            LeadExceptionCode.LEAD_NOT_FOUND,
          );
        }

        try {
          // Generate new lead number for duplicated lead
          const newLeadNo =
            await this.leadNumberGeneratorService.generateLeadNumber(
              workspaceId,
            );

          const newLead = await this.createDuplicatedLead(
            originalLead,
            newLeadNo,
            leadRepository,
            authContext,
          );

          return {
            id: newLead.id,
            leadNo: newLead.leadNo,
            customerName: newLead.customerName,
            contactNumber: newLead.contactNumber?.primaryPhoneNumber || null,
            createdAt: newLead.createdAt,
            updatedAt: newLead.updatedAt,
          };
        } catch (error) {
          this.logger.error(
            `Failed to duplicate lead ${leadId}: ${error.message}`,
            error.stack,
          );

          throw error;
        }
      },
    );
  }

  private async createDuplicatedLead(
    originalLead: LeadWorkspaceEntity,
    newLeadNo: string,
    leadRepository: WorkspaceRepository<LeadWorkspaceEntity>,
    authContext: AuthContext,
  ): Promise<LeadWorkspaceEntity> {
    // Copy relevant fields from original lead
    const leadDataToCopy = {
      leadNo: newLeadNo,
      customerName: originalLead.customerName,
      contactNumber: originalLead.contactNumber,
      product: originalLead.product,
      loanAmount: originalLead.loanAmount,
      locationText: originalLead.locationText,
      locationLat: originalLead.locationLat,
      locationLng: originalLead.locationLng,
      referredBy: originalLead.referredBy,
      shortDescription: originalLead.shortDescription,
      status: originalLead.status,
      // Don't copy assignedToId - let it be assigned manually
      // Don't copy dates or IDs
    };

    const [recordWithActor] =
      await this.actorFromAuthContextService.injectActorFieldsOnCreate({
        records: [leadDataToCopy],
        objectMetadataNameSingular: 'lead',
        authContext,
      });

    const insertResult = await leadRepository.insert(recordWithActor);

    const newLeadId = insertResult.identifiers[0].id;

    const newLead = await leadRepository.findOne({
      where: { id: newLeadId },
    });

    if (!isDefined(newLead)) {
      throw new LeadException(
        generateLeadExceptionMessage(
          LeadExceptionMessageKey.LEAD_DUPLICATION_FAILED,
          'Failed to retrieve created lead',
        ),
        LeadExceptionCode.LEAD_DUPLICATION_FAILED,
      );
    }

    return newLead;
  }
}
