import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import styled from '@emotion/styled';
import { Button } from 'twenty-ui/input';
import { IconFileTypePdf, IconFileTypeDocx, IconDownload } from 'twenty-ui';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const EXPORT_TO_PDF_QUERY = gql`
  query ExportLeadToPDF($leadId: String!, $includeLetterhead: Boolean) {
    exportLeadToPDF(leadId: $leadId, includeLetterhead: $includeLetterhead)
  }
`;

const EXPORT_TO_WORD_QUERY = gql`
  query ExportLeadToWord($leadId: String!, $includeLetterhead: Boolean) {
    exportLeadToWord(leadId: $leadId, includeLetterhead: $includeLetterhead)
  }
`;

const GET_PREVIEW_QUERY = gql`
  query GetLeadExportPreview($leadId: String!, $includeLetterhead: Boolean) {
    getLeadExportPreview(leadId: $leadId, includeLetterhead: $includeLetterhead)
  }
`;

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
`;

interface ExportLeadButtonsProps {
  leadId: string;
  leadNo?: string;
}

/**
 * Export Lead Buttons
 * 
 * Provides export functionality for lead data to PDF and Word formats.
 * Features:
 * - Export to PDF with letterhead
 * - Export to Word document
 * - Preview HTML before export
 * - Download generated files
 * - Toggle letterhead inclusion
 */
export const ExportLeadButtons = ({ leadId, leadNo }: ExportLeadButtonsProps) => {
  const { enqueueSnackBar } = useSnackBar();
  const [includeLetterhead, setIncludeLetterhead] = useState(true);

  const downloadFile = (base64Data: string, filename: string, mimeType: string) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackBar(`${filename} downloaded successfully`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackBar(`Failed to download file: ${error.message}`, {
        variant: 'error',
      });
    }
  };

  const { refetch: exportToPDF, loading: exportingPDF } = useQuery(
    EXPORT_TO_PDF_QUERY,
    {
      variables: { leadId, includeLetterhead },
      skip: true,
      onCompleted: (data) => {
        if (data?.exportLeadToPDF) {
          const filename = `Lead_${leadNo || leadId}_${new Date().toISOString().split('T')[0]}.pdf`;
          downloadFile(data.exportLeadToPDF, filename, 'application/pdf');
        }
      },
      onError: (error) => {
        enqueueSnackBar(`Failed to export PDF: ${error.message}`, {
          variant: 'error',
        });
      },
    },
  );

  const { refetch: exportToWord, loading: exportingWord } = useQuery(
    EXPORT_TO_WORD_QUERY,
    {
      variables: { leadId, includeLetterhead },
      skip: true,
      onCompleted: (data) => {
        if (data?.exportLeadToWord) {
          const filename = `Lead_${leadNo || leadId}_${new Date().toISOString().split('T')[0]}.docx`;
          downloadFile(
            data.exportLeadToWord,
            filename,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          );
        }
      },
      onError: (error) => {
        enqueueSnackBar(`Failed to export Word: ${error.message}`, {
          variant: 'error',
        });
      },
    },
  );

  const { refetch: getPreview, loading: loadingPreview } = useQuery(
    GET_PREVIEW_QUERY,
    {
      variables: { leadId, includeLetterhead },
      skip: true,
      onCompleted: (data) => {
        if (data?.getLeadExportPreview) {
          // Open preview in new window
          const previewWindow = window.open('', '_blank');
          if (previewWindow) {
            previewWindow.document.write(data.getLeadExportPreview);
            previewWindow.document.close();
          }
        }
      },
      onError: (error) => {
        enqueueSnackBar(`Failed to load preview: ${error.message}`, {
          variant: 'error',
        });
      },
    },
  );

  const handleExportPDF = () => {
    exportToPDF();
  };

  const handleExportWord = () => {
    exportToWord();
  };

  const handlePreview = () => {
    getPreview();
  };

  return (
    <Container>
      <Button
        Icon={IconFileTypePdf}
        title="Export to PDF"
        onClick={handleExportPDF}
        disabled={exportingPDF}
        variant="secondary"
        size="small"
      />
      <Button
        Icon={IconFileTypeDocx}
        title="Export to Word"
        onClick={handleExportWord}
        disabled={exportingWord}
        variant="secondary"
        size="small"
      />
      <Button
        Icon={IconDownload}
        title="Preview"
        onClick={handlePreview}
        disabled={loadingPreview}
        variant="tertiary"
        size="small"
      />
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={includeLetterhead}
          onChange={(e) => setIncludeLetterhead(e.target.checked)}
        />
        Include Letterhead
      </CheckboxLabel>
    </Container>
  );
};
