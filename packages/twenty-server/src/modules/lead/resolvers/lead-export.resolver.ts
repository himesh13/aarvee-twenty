import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import {
  ExportFormat,
  LeadExportService,
} from 'src/modules/lead/services/lead-export.service';

/**
 * Lead Export Resolver
 * 
 * GraphQL resolver for lead export operations (PDF/Word)
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class LeadExportResolver {
  constructor(private readonly leadExportService: LeadExportService) {}

  /**
   * Export lead to PDF
   * Returns a base64 encoded PDF
   */
  @Query(() => String)
  async exportLeadToPDF(
    @AuthWorkspace() workspace: Workspace,
    @Args('leadId', { type: () => String }) leadId: string,
    @Args('includeLetterhead', { type: () => Boolean, nullable: true })
    includeLetterhead?: boolean,
  ): Promise<string> {
    const pdfBuffer = await this.leadExportService.exportToPDF(
      workspace.id,
      leadId,
      includeLetterhead !== false,
    );

    // Return as base64 for GraphQL response
    return pdfBuffer.toString('base64');
  }

  /**
   * Export lead to Word
   * Returns a base64 encoded Word document
   */
  @Query(() => String)
  async exportLeadToWord(
    @AuthWorkspace() workspace: Workspace,
    @Args('leadId', { type: () => String }) leadId: string,
    @Args('includeLetterhead', { type: () => Boolean, nullable: true })
    includeLetterhead?: boolean,
  ): Promise<string> {
    const wordBuffer = await this.leadExportService.exportToWord(
      workspace.id,
      leadId,
      includeLetterhead !== false,
    );

    // Return as base64 for GraphQL response
    return wordBuffer.toString('base64');
  }

  /**
   * Get HTML preview of lead export
   * Useful for testing and previewing the export format
   */
  @Query(() => String)
  async getLeadExportPreview(
    @AuthWorkspace() workspace: Workspace,
    @Args('leadId', { type: () => String }) leadId: string,
    @Args('includeLetterhead', { type: () => Boolean, nullable: true })
    includeLetterhead?: boolean,
  ): Promise<string> {
    const data = await this.leadExportService.gatherLeadData(
      workspace.id,
      leadId,
    );

    // Use the private method through reflection (for testing/preview only)
    const htmlContent = (this.leadExportService as any).generateHTMLContent(
      data,
      includeLetterhead !== false,
    );

    return htmlContent;
  }
}
