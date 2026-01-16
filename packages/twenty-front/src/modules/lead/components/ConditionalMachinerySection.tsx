import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

import { RecordDetailRelationSection } from '@/object-record/record-show/components/RecordDetailRelationSection';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const InfoBox = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

interface ConditionalMachinerySectionProps {
  leadId: string;
  productName: string;
  isVisible?: boolean;
}

/**
 * Conditional Machinery Section
 * 
 * Shows machinery details section only for machinery loan products.
 * Based on requirements: Machinery details for machinery loans.
 * 
 * Features:
 * - Conditional rendering based on product type
 * - Integration with Twenty's relation section
 * - Info message when machinery not applicable
 * - Support for: Brand, Model, Purchase/Invoice Value, MFG/Purchase Year, Description
 */
export const ConditionalMachinerySection = ({
  leadId,
  productName,
  isVisible,
}: ConditionalMachinerySectionProps) => {
  const [shouldShowMachinery, setShouldShowMachinery] = useState(false);

  // Product types that require machinery details
  const machineryBasedProducts = [
    'Machinery Loan',
    'Equipment Loan',
    'Plant and Machinery',
    'Industrial Equipment',
    'Construction Equipment Loan',
  ];

  useEffect(() => {
    if (!productName) {
      setShouldShowMachinery(false);
      return;
    }

    // Check if product requires machinery details (case-insensitive)
    const requiresMachinery = machineryBasedProducts.some((product) =>
      productName.toLowerCase().includes(product.toLowerCase()),
    );

    setShouldShowMachinery(requiresMachinery);
  }, [productName]);

  // Allow manual override via prop
  const showSection = isVisible !== undefined ? isVisible : shouldShowMachinery;

  if (!showSection) {
    return (
      <Container>
        <InfoBox>
          Machinery details are not required for this loan product.
          Machinery section is only available for: Machinery Loan, Equipment Loan, 
          Plant and Machinery, and Industrial Equipment loans.
        </InfoBox>
      </Container>
    );
  }

  return (
    <Container>
      <RecordDetailRelationSection
        relationName="machineries"
        relatedObjectNameSingular="machinery"
        relatedObjectNamePlural="machineries"
      />
    </Container>
  );
};
