import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

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

const Title = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
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
 * - Info message when machinery not applicable
 * - Support for: Brand, Model, Purchase/Invoice Value, MFG/Purchase Year, Description
 * 
 * Note: This component is a placeholder. To properly display machinery relations,
 * integrate with Twenty's RecordFieldList component which provides the necessary
 * FieldContext and metadata for relation fields.
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
      <Title>Machinery Details</Title>
      <InfoBox>
        This section will display machinery relations. To use this section in production,
        ensure that the machinery relation field is properly configured in your object metadata
        and use Twenty's RecordFieldList component with the appropriate FieldContext.
      </InfoBox>
    </Container>
  );
};
