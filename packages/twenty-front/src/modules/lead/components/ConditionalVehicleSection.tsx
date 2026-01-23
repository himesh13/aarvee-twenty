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

interface ConditionalVehicleSectionProps {
  leadId: string;
  productName: string;
  isVisible?: boolean;
}

/**
 * Conditional Vehicle Section
 * 
 * Shows vehicle details section only for auto loan products.
 * Based on requirements: Vehicle details must be opened only for Auto Loan.
 * 
 * Features:
 * - Conditional rendering based on product type
 * - Info message when vehicles not applicable
 * - Support for: Brand, Model, Sub Model, MFG Year, Insurance Validity
 * 
 * Note: This component is a placeholder. To properly display vehicle relations,
 * integrate with Twenty's RecordFieldList component which provides the necessary
 * FieldContext and metadata for relation fields.
 */
export const ConditionalVehicleSection = ({
  leadId,
  productName,
  isVisible,
}: ConditionalVehicleSectionProps) => {
  const [shouldShowVehicles, setShouldShowVehicles] = useState(false);

  // Product types that require vehicle details
  const vehicleBasedProducts = [
    'Auto Loan',
    'Car Loan',
    'Vehicle Loan',
    'Two Wheeler Loan',
    'Commercial Vehicle Loan',
  ];

  useEffect(() => {
    if (!productName) {
      setShouldShowVehicles(false);
      return;
    }

    // Check if product requires vehicle details (case-insensitive)
    const requiresVehicle = vehicleBasedProducts.some((product) =>
      productName.toLowerCase().includes(product.toLowerCase()),
    );

    setShouldShowVehicles(requiresVehicle);
  }, [productName]);

  // Allow manual override via prop
  const showSection = isVisible !== undefined ? isVisible : shouldShowVehicles;

  if (!showSection) {
    return (
      <Container>
        <InfoBox>
          Vehicle details are not required for this loan product.
          Vehicles section is only available for: Auto Loan, Car Loan, Two Wheeler Loan, 
          and Commercial Vehicle Loan.
        </InfoBox>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Vehicle Details</Title>
      <InfoBox>
        This section will display vehicle relations. To use this section in production,
        ensure that the vehicle relation field is properly configured in your object metadata
        and use Twenty's RecordFieldList component with the appropriate FieldContext.
      </InfoBox>
    </Container>
  );
};
