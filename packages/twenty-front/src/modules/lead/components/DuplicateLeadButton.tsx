import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from 'twenty-ui/input';
import { IconCopy } from 'twenty-ui/display';

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
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  
  const [duplicateLead, { loading }] = useMutation(DUPLICATE_LEAD_MUTATION, {
    onCompleted: (data) => {
      if (data?.duplicateLead) {
        enqueueSuccessSnackBar({
          message: `Lead duplicated successfully: ${data.duplicateLead.leadNo}`,
        });
        
        if (onSuccess) {
          onSuccess(data.duplicateLead.id);
        } else {
          // Navigate to the new lead
          window.location.href = `/object/lead/${data.duplicateLead.id}`;
        }
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: `Failed to duplicate lead: ${error.message}`,
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
