import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { IconCopy } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const DUPLICATE_LEAD_MUTATION = gql`
  mutation DuplicateLead($id: UUID!) {
    duplicateLead(id: $id) {
      id
      leadNo
      customerName
      createdAt
    }
  }
`;

interface DuplicateLeadButtonProps {
  leadId: string;
  onSuccess?: (newLeadId: string) => void;
}

/**
 * Duplicate Lead Button
 * 
 * Duplicates a lead with a new lead number and redirects to the new lead.
 * Uses the duplicateLead GraphQL mutation from the backend.
 */
export const DuplicateLeadButton = ({
  leadId,
  onSuccess,
}: DuplicateLeadButtonProps) => {
  const { enqueueSnackBar } = useSnackBar();
  
  const [duplicateLead, { loading }] = useMutation(DUPLICATE_LEAD_MUTATION, {
    onCompleted: (data) => {
      if (data?.duplicateLead) {
        enqueueSnackBar(
          `Lead duplicated successfully: ${data.duplicateLead.leadNo}`,
          {
            variant: 'success',
          },
        );
        
        if (onSuccess) {
          onSuccess(data.duplicateLead.id);
        } else {
          // Navigate to the new lead
          window.location.href = `/object/lead/${data.duplicateLead.id}`;
        }
      }
    },
    onError: (error) => {
      enqueueSnackBar(`Failed to duplicate lead: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const handleDuplicate = () => {
    duplicateLead({
      variables: { id: leadId },
    });
  };

  return (
    <Button
      Icon={IconCopy}
      title="Duplicate Lead"
      onClick={handleDuplicate}
      disabled={loading}
      variant="secondary"
    />
  );
};
