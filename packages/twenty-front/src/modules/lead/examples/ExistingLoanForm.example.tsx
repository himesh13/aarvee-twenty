/**
 * Example: Existing Loan Form with Auto-Calculated Fields
 * 
 * This example demonstrates how to use the ExistingLoanDetails component
 * to create a form with auto-calculated remaining tenure and payable amount.
 */

import { useState } from 'react';
import styled from '@emotion/styled';
import { ExistingLoanDetails } from '@/modules/lead';
import { Button } from '@/ui/input/button/components/Button';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const FormSection = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const InfoBox = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

interface ExistingLoanData {
  loanType: string;
  bankName: string;
  tenure: number;
  paidEmi: number;
  emiAmount: number;
  loanAmount: number;
  interestRate: number;
}

/**
 * Existing Loan Form Example
 * 
 * Features demonstrated:
 * - Using ExistingLoanDetails component
 * - Auto-calculation of remaining tenure
 * - Auto-calculation of remaining payable amount
 * - Form state management
 * - Validation
 * - Save functionality
 */
export const ExistingLoanFormExample = () => {
  const { enqueueSnackBar } = useSnackBar();
  
  const [loanData, setLoanData] = useState<ExistingLoanData>({
    loanType: 'Home Loan',
    bankName: 'HDFC Bank',
    tenure: 240, // 20 years
    paidEmi: 48, // 4 years paid
    emiAmount: 25000,
    loanAmount: 5000000,
    interestRate: 8.5,
  });

  const handleTenureChange = (value: number) => {
    setLoanData((prev) => ({ ...prev, tenure: value }));
  };

  const handlePaidEmiChange = (value: number) => {
    setLoanData((prev) => ({ ...prev, paidEmi: value }));
  };

  const handleEmiAmountChange = (value: number) => {
    setLoanData((prev) => ({ ...prev, emiAmount: value }));
  };

  const handleSave = () => {
    // Calculate remaining values
    const remainingTenure = loanData.tenure - loanData.paidEmi;
    const remainingPayable = loanData.emiAmount * remainingTenure;

    // In a real application, you would save this to the backend
    console.log('Saving loan data:', {
      ...loanData,
      remainingTenure,
      remainingPayable,
    });

    enqueueSnackBar('Existing loan details saved successfully', {
      variant: 'success',
    });
  };

  const handleReset = () => {
    setLoanData({
      loanType: 'Home Loan',
      bankName: 'HDFC Bank',
      tenure: 240,
      paidEmi: 48,
      emiAmount: 25000,
      loanAmount: 5000000,
      interestRate: 8.5,
    });
  };

  // Calculate summary
  const remainingTenure = loanData.tenure - loanData.paidEmi;
  const remainingPayable = loanData.emiAmount * remainingTenure;
  const totalPayable = loanData.emiAmount * loanData.tenure;
  const paidAmount = loanData.emiAmount * loanData.paidEmi;
  const percentPaid = loanData.tenure > 0 
    ? ((loanData.paidEmi / loanData.tenure) * 100).toFixed(1)
    : 0;

  return (
    <Container>
      <Title>Existing Loan Details</Title>

      <FormSection>
        <h3>Basic Information</h3>
        <div style={{ marginBottom: '16px' }}>
          <label>
            <strong>Loan Type:</strong> {loanData.loanType}
          </label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>
            <strong>Bank Name:</strong> {loanData.bankName}
          </label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>
            <strong>Loan Amount:</strong> ₹{loanData.loanAmount.toLocaleString('en-IN')}
          </label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>
            <strong>Interest Rate:</strong> {loanData.interestRate}%
          </label>
        </div>
      </FormSection>

      <FormSection>
        <h3>EMI & Tenure Details</h3>
        <ExistingLoanDetails
          tenure={loanData.tenure}
          paidEmi={loanData.paidEmi}
          emiAmount={loanData.emiAmount}
          onTenureChange={handleTenureChange}
          onPaidEmiChange={handlePaidEmiChange}
          onEmiAmountChange={handleEmiAmountChange}
          readonly={false}
        />

        <InfoBox>
          <h4 style={{ marginTop: 0 }}>Summary</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              <strong>Total Payable:</strong> ₹{totalPayable.toLocaleString('en-IN')}
            </li>
            <li>
              <strong>Paid Amount:</strong> ₹{paidAmount.toLocaleString('en-IN')} ({percentPaid}%)
            </li>
            <li>
              <strong>Remaining Payable:</strong> ₹{remainingPayable.toLocaleString('en-IN')}
            </li>
            <li>
              <strong>Remaining Tenure:</strong> {remainingTenure} months 
              ({Math.floor(remainingTenure / 12)} years {remainingTenure % 12} months)
            </li>
          </ul>
        </InfoBox>
      </FormSection>

      <FormActions>
        <Button
          title="Reset"
          onClick={handleReset}
          variant="tertiary"
        />
        <Button
          title="Save Loan Details"
          onClick={handleSave}
          variant="primary"
        />
      </FormActions>

      {/* Educational Section */}
      <FormSection style={{ marginTop: '32px' }}>
        <h3>How it Works</h3>
        <p>
          The <code>ExistingLoanDetails</code> component automatically calculates:
        </p>
        <ol>
          <li>
            <strong>Remaining Tenure</strong> = Tenure (months) - Paid EMI (months)
            <br />
            Example: 240 - 48 = 192 months (16 years)
          </li>
          <li>
            <strong>Remaining Payable</strong> = EMI Amount × Remaining Tenure
            <br />
            Example: ₹25,000 × 192 = ₹48,00,000
          </li>
        </ol>
        <p>
          The component also validates that Paid EMI doesn't exceed Tenure,
          showing an error message if validation fails.
        </p>
      </FormSection>

      {/* Code Example Section */}
      <FormSection style={{ marginTop: '16px' }}>
        <h3>Code Example</h3>
        <pre style={{ 
          backgroundColor: '#1e1e1e', 
          color: '#d4d4d4', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '14px',
        }}>
{`import { ExistingLoanDetails } from '@/modules/lead';

<ExistingLoanDetails
  tenure={240}
  paidEmi={48}
  emiAmount={25000}
  onTenureChange={(value) => setTenure(value)}
  onPaidEmiChange={(value) => setPaidEmi(value)}
  onEmiAmountChange={(value) => setEmiAmount(value)}
  readonly={false}
/>`}
        </pre>
      </FormSection>
    </Container>
  );
};

/**
 * USAGE NOTES:
 * 
 * 1. The ExistingLoanDetails component is designed to be used within
 *    existing loan forms or lead detail pages.
 * 
 * 2. It automatically handles:
 *    - Remaining tenure calculation
 *    - Remaining payable amount calculation
 *    - Input validation
 *    - Visual feedback for computed values
 * 
 * 3. The component is read-only mode compatible, making it suitable
 *    for both edit and view scenarios.
 * 
 * 4. All calculations are done in real-time as the user types,
 *    with debouncing handled automatically.
 * 
 * 5. For integration with GraphQL mutations, wrap the save handler
 *    with appropriate error handling and loading states.
 */
