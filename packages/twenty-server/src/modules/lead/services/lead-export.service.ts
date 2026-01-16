import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { LeadWorkspaceEntity } from 'src/modules/lead/standard-objects/lead.workspace-entity';

export enum ExportFormat {
  PDF = 'PDF',
  WORD = 'WORD',
}

export interface LeadExportData {
  lead: LeadWorkspaceEntity;
  companyParties: any[];
  individualParties: any[];
  properties: any[];
  references: any[];
  businessDetail?: any;
}

/**
 * Lead Export Service
 * 
 * Handles exporting lead data to PDF and Word formats
 * Features:
 * - Login details on letterhead
 * - Applicant and co-applicant details
 * - Property details (for applicable loan types)
 * - Reference information
 * - Professional formatting
 */
@Injectable()
export class LeadExportService {
  private readonly logger = new Logger(LeadExportService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Gather all lead data for export
   * 
   * @param workspaceId Workspace ID
   * @param leadId Lead ID
   * @returns Complete lead data with related entities
   */
  async gatherLeadData(
    workspaceId: string,
    leadId: string,
  ): Promise<LeadExportData> {
    const leadRepository =
      await this.globalWorkspaceOrmManager.getRepository<LeadWorkspaceEntity>(
        workspaceId,
        'lead',
      );

    const lead = await leadRepository.findOne({
      where: { id: leadId },
      relations: [
        'product',
        'status',
        'assignedTo',
        'leadBusinessDetail',
        'companyParties',
        'individualParties',
        'properties',
        'references',
      ],
    });

    if (!isDefined(lead)) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    return {
      lead,
      companyParties: lead.companyParties || [],
      individualParties: lead.individualParties || [],
      properties: lead.properties || [],
      references: lead.references || [],
      businessDetail: lead.leadBusinessDetail,
    };
  }

  /**
   * Export lead to PDF format
   * 
   * @param workspaceId Workspace ID
   * @param leadId Lead ID
   * @param includeLetterhead Include company letterhead
   * @returns PDF buffer
   */
  async exportToPDF(
    workspaceId: string,
    leadId: string,
    includeLetterhead: boolean = true,
  ): Promise<Buffer> {
    try {
      this.logger.log(`Exporting lead ${leadId} to PDF`);

      const data = await this.gatherLeadData(workspaceId, leadId);

      // TODO: Implement actual PDF generation using puppeteer or pdf-lib
      // For now, returning a placeholder
      
      const htmlContent = this.generateHTMLContent(data, includeLetterhead);
      
      // In full implementation:
      // 1. Use puppeteer to render HTML to PDF
      // 2. Or use pdf-lib to programmatically create PDF
      // 3. Include letterhead if requested
      // 4. Format according to requirements (applicant details, property info, etc.)

      this.logger.log(`PDF generation completed for lead ${leadId}`);

      // Placeholder: return empty buffer
      return Buffer.from('PDF content would be here');
    } catch (error) {
      this.logger.error(
        `Failed to export lead to PDF: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Export lead to Word format
   * 
   * @param workspaceId Workspace ID
   * @param leadId Lead ID
   * @param includeLetterhead Include company letterhead
   * @returns Word document buffer
   */
  async exportToWord(
    workspaceId: string,
    leadId: string,
    includeLetterhead: boolean = true,
  ): Promise<Buffer> {
    try {
      this.logger.log(`Exporting lead ${leadId} to Word`);

      const data = await this.gatherLeadData(workspaceId, leadId);

      // TODO: Implement actual Word generation using docxtemplater or officegen
      // For now, returning a placeholder
      
      // In full implementation:
      // 1. Use docxtemplater with a template file
      // 2. Or use officegen to programmatically create Word document
      // 3. Include letterhead if requested
      // 4. Format according to requirements

      this.logger.log(`Word generation completed for lead ${leadId}`);

      // Placeholder: return empty buffer
      return Buffer.from('Word document content would be here');
    } catch (error) {
      this.logger.error(
        `Failed to export lead to Word: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate HTML content for PDF export
   * 
   * @param data Lead export data
   * @param includeLetterhead Include letterhead
   * @returns HTML string
   */
  private generateHTMLContent(
    data: LeadExportData,
    includeLetterhead: boolean,
  ): string {
    const { lead, companyParties, individualParties, properties, references } =
      data;

    // Build HTML template for login details document
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    ${includeLetterhead ? this.getLetterheadStyles() : ''}
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    .section {
      margin: 20px 0;
    }
    .field {
      margin: 10px 0;
    }
    .field-label {
      font-weight: bold;
      display: inline-block;
      width: 200px;
    }
    .field-value {
      display: inline-block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #3498db;
      color: white;
    }
  </style>
</head>
<body>
`;

    if (includeLetterhead) {
      html += this.getLetterheadHTML();
    }

    html += `
  <h1>Lead Details - ${lead.leadNo}</h1>
  
  <div class="section">
    <h2>Basic Information</h2>
    <div class="field">
      <span class="field-label">Customer Name:</span>
      <span class="field-value">${lead.customerName}</span>
    </div>
    <div class="field">
      <span class="field-label">Contact Number:</span>
      <span class="field-value">${lead.contactNumber || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Loan Amount Required:</span>
      <span class="field-value">₹${lead.loanAmountRequired?.toLocaleString() || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Location:</span>
      <span class="field-value">${lead.location || 'N/A'}</span>
    </div>
  </div>
`;

    // Add company applicants
    if (companyParties && companyParties.length > 0) {
      html += `
  <div class="section">
    <h2>Company Applicants</h2>
    <table>
      <tr>
        <th>Role</th>
        <th>Company Name</th>
        <th>PAN</th>
        <th>Registration No</th>
        <th>Contact</th>
      </tr>
`;
      companyParties.forEach((company) => {
        html += `
      <tr>
        <td>${company.role || 'N/A'}</td>
        <td>${company.name || 'N/A'}</td>
        <td>${company.pan || 'N/A'}</td>
        <td>${company.registrationNo || 'N/A'}</td>
        <td>${company.contactNumber || 'N/A'}</td>
      </tr>
`;
      });
      html += `
    </table>
  </div>
`;
    }

    // Add individual applicants
    if (individualParties && individualParties.length > 0) {
      html += `
  <div class="section">
    <h2>Individual Applicants</h2>
    <table>
      <tr>
        <th>Role</th>
        <th>Name</th>
        <th>PAN</th>
        <th>Aadhar</th>
        <th>Contact</th>
        <th>Education</th>
      </tr>
`;
      individualParties.forEach((individual) => {
        html += `
      <tr>
        <td>${individual.role || 'N/A'}</td>
        <td>${individual.name || 'N/A'}</td>
        <td>${individual.pan || 'N/A'}</td>
        <td>${individual.aadhar || 'N/A'}</td>
        <td>${individual.contactNumber || 'N/A'}</td>
        <td>${individual.education || 'N/A'}</td>
      </tr>
`;
      });
      html += `
    </table>
  </div>
`;
    }

    // Add property details if applicable
    if (properties && properties.length > 0) {
      html += `
  <div class="section">
    <h2>Property Details</h2>
    <table>
      <tr>
        <th>Type</th>
        <th>Value</th>
        <th>Area</th>
        <th>Address</th>
      </tr>
`;
      properties.forEach((property) => {
        html += `
      <tr>
        <td>${property.type || 'N/A'}</td>
        <td>₹${property.value?.toLocaleString() || 'N/A'}</td>
        <td>${property.area || 'N/A'} ${property.areaUnit || ''}</td>
        <td>${property.address || 'N/A'}</td>
      </tr>
`;
      });
      html += `
    </table>
  </div>
`;
    }

    // Add references
    if (references && references.length > 0) {
      html += `
  <div class="section">
    <h2>References</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>Firm Name</th>
        <th>Mobile</th>
        <th>Relationship</th>
      </tr>
`;
      references.forEach((reference) => {
        html += `
      <tr>
        <td>${reference.name || 'N/A'}</td>
        <td>${reference.firmName || 'N/A'}</td>
        <td>${reference.mobileNumber || 'N/A'}</td>
        <td>${reference.relationship || 'N/A'}</td>
      </tr>
`;
      });
      html += `
    </table>
  </div>
`;
    }

    html += `
</body>
</html>
`;

    return html;
  }

  /**
   * Get letterhead styles
   */
  private getLetterheadStyles(): string {
    return `
    .letterhead {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      border-bottom: 3px solid #3498db;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .company-details {
      font-size: 12px;
      color: #7f8c8d;
    }
    `;
  }

  /**
   * Get letterhead HTML
   */
  private getLetterheadHTML(): string {
    // TODO: Get actual company details from workspace settings
    return `
  <div class="letterhead">
    <div class="company-name">Your Company Name</div>
    <div class="company-details">
      Address Line 1, Address Line 2<br>
      Phone: +91-XXXXXXXXXX | Email: info@company.com<br>
      Website: www.company.com
    </div>
  </div>
    `;
  }
}
