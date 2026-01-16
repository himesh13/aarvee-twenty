import { useMemo } from 'react';
import styled from '@emotion/styled';

import { FieldTextInput } from '@/object-record/record-field/meta-types/input/components/FieldTextInput';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const FieldWrapper = styled.div`
  flex: 1;
`;

const ComputedValue = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  display: block;
`;

interface ExistingLoanDetailsProps {
  tenure: number;
  paidEmi: number;
  emiAmount: number;
  onTenureChange: (value: number) => void;
  onPaidEmiChange: (value: number) => void;
  onEmiAmountChange: (value: number) => void;
  readonly?: boolean;
}

/**
 * Existing Loan Details Component
 * 
 * Displays existing loan details with auto-calculated remaining tenure.
 * Implements the requirement: "Remaining Tenure = tenure - paid EMI"
 * 
 * Features:
 * - Auto-calculates remaining tenure
 * - Validates that paid EMI doesn't exceed tenure
 * - Shows visual feedback for computed values
 */
export const ExistingLoanDetails = ({
  tenure,
  paidEmi,
  emiAmount,
  onTenureChange,
  onPaidEmiChange,
  onEmiAmountChange,
  readonly = false,
}: ExistingLoanDetailsProps) => {
  // Auto-calculate remaining tenure
  const remainingTenure = useMemo(() => {
    if (!tenure || tenure <= 0) return 0;
    if (!paidEmi || paidEmi < 0) return tenure;
    return Math.max(0, tenure - paidEmi);
  }, [tenure, paidEmi]);

  // Calculate remaining payable amount
  const remainingPayable = useMemo(() => {
    if (!emiAmount || emiAmount <= 0) return 0;
    return emiAmount * remainingTenure;
  }, [emiAmount, remainingTenure]);

  // Validation: paid EMI should not exceed tenure
  const isValidPaidEmi = !paidEmi || !tenure || paidEmi <= tenure;

  return (
    <Container>
      <Row>
        <FieldWrapper>
          <Label>Tenure (Months) *</Label>
          <FieldTextInput
            value={tenure?.toString() || ''}
            onChange={(value) => {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
                onTenureChange(numValue);
              }
            }}
            placeholder="e.g., 240"
            readonly={readonly}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>Paid EMI (Months) *</Label>
          <FieldTextInput
            value={paidEmi?.toString() || ''}
            onChange={(value) => {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
                onPaidEmiChange(numValue);
              }
            }}
            placeholder="e.g., 48"
            readonly={readonly}
          />
          {!isValidPaidEmi && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Paid EMI cannot exceed tenure
            </div>
          )}
        </FieldWrapper>
      </Row>

      <Row>
        <FieldWrapper>
          <Label>EMI Amount (₹)</Label>
          <FieldTextInput
            value={emiAmount?.toString() || ''}
            onChange={(value) => {
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue >= 0) {
                onEmiAmountChange(numValue);
              }
            }}
            placeholder="e.g., 25000"
            readonly={readonly}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>Remaining Tenure (Months)</Label>
          <ComputedValue>
            {remainingTenure} months
            {remainingTenure > 0 && (
              <span style={{ fontSize: '12px', marginLeft: '8px', opacity: 0.7 }}>
                ({Math.floor(remainingTenure / 12)} years {remainingTenure % 12} months)
              </span>
            )}
          </ComputedValue>
        </FieldWrapper>
      </Row>

      {remainingPayable > 0 && (
        <Row>
          <FieldWrapper>
            <Label>Remaining Payable Amount</Label>
            <ComputedValue>
              ₹{remainingPayable.toLocaleString('en-IN')}
            </ComputedValue>
          </FieldWrapper>
        </Row>
      )}
    </Container>
  );
};
