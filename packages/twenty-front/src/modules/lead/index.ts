/**
 * Lead Module
 * 
 * Custom components and hooks for the Lead Management System.
 * These components enhance Twenty's auto-generated UI with business-specific functionality.
 */

// Components
export {
  ConditionalMachinerySection,
  ConditionalPropertySection,
  ConditionalVehicleSection,
  DuplicateLeadButton,
  ExistingLoanDetails,
  ExportLeadButtons,
  ReminderPanel,
} from './components';

// Hooks
export { useAutoSave } from './hooks';

// Types
export type { UseAutoSaveOptions } from './hooks/useAutoSave';
