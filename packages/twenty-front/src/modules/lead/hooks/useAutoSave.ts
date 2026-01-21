import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { debounce } from 'lodash';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const UPDATE_LEAD_MUTATION = gql`
  mutation UpdateLead($id: UUID!, $input: LeadUpdateInput!) {
    updateLead(id: $id, data: $input) {
      id
      updatedAt
    }
  }
`;

export interface UseAutoSaveOptions {
  leadId: string;
  formData: any;
  enabled?: boolean;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Auto-save hook for lead forms
 * 
 * Automatically saves form data after a period of inactivity.
 * Features:
 * - Debounced saving (default 2 seconds)
 * - Error handling with user feedback
 * - Can be enabled/disabled
 * - Handles light/phone power interruptions
 * 
 * Usage:
 * ```typescript
 * const { isSaving, lastSaved } = useAutoSave({
 *   leadId: 'uuid',
 *   formData: { customerName: 'John', contactNumber: '9876543210' },
 *   enabled: true,
 * });
 * ```
 */
export const useAutoSave = ({
  leadId,
  formData,
  enabled = true,
  debounceMs = 2000,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) => {
  const { enqueueSnackBar } = useSnackBar();
  const lastSavedRef = useRef<Date | null>(null);
  
  const [updateLead, { loading: isSaving }] = useMutation(UPDATE_LEAD_MUTATION, {
    onCompleted: () => {
      lastSavedRef.current = new Date();
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    },
    onError: (error) => {
      enqueueSnackBar(`Auto-save failed: ${error.message}`, {
        variant: 'error',
      });
      if (onSaveError) {
        onSaveError(error);
      }
    },
  });

  const debouncedSave = useRef(
    debounce(async (data: any) => {
      try {
        await updateLead({
          variables: {
            id: leadId,
            input: data,
          },
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, debounceMs),
  ).current;

  useEffect(() => {
    if (enabled && leadId && formData) {
      debouncedSave(formData);
    }

    // Cleanup on unmount
    return () => {
      debouncedSave.cancel();
    };
  }, [formData, leadId, enabled, debouncedSave]);

  // Save on page unload (browser close, refresh, etc.)
  useEffect(() => {
    if (!enabled || !leadId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Cancel debounced save and save immediately
      debouncedSave.cancel();
      
      // Use sendBeacon for async save on page unload
      // This works even if the page is closing
      const data = JSON.stringify({
        query: UPDATE_LEAD_MUTATION.loc?.source.body,
        variables: {
          id: leadId,
          input: formData,
        },
      });
      
      navigator.sendBeacon('/graphql', data);
      
      // Optional: Show warning if user tries to leave with unsaved changes
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, leadId, formData, debouncedSave]);

  return {
    isSaving,
    lastSaved: lastSavedRef.current,
    forceSave: () => {
      debouncedSave.cancel();
      return updateLead({
        variables: {
          id: leadId,
          input: formData,
        },
      });
    },
  };
};
