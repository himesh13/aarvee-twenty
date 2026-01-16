import { CustomException } from 'src/engine/core-modules/exception-handler/exceptions/custom.exception';

export enum LeadExceptionCode {
  LEAD_NOT_FOUND = 'LEAD_NOT_FOUND',
  LEAD_DUPLICATION_FAILED = 'LEAD_DUPLICATION_FAILED',
  LEAD_RESTORE_FAILED = 'LEAD_RESTORE_FAILED',
  LEAD_NUMBER_GENERATION_FAILED = 'LEAD_NUMBER_GENERATION_FAILED',
  INVALID_LEAD_DATA = 'INVALID_LEAD_DATA',
}

export class LeadException extends CustomException {
  code: LeadExceptionCode;
  constructor(message: string, code: LeadExceptionCode) {
    super(message, code);
  }
}

export enum LeadExceptionMessageKey {
  LEAD_NOT_FOUND = 'LEAD_NOT_FOUND',
  LEAD_DUPLICATION_FAILED = 'LEAD_DUPLICATION_FAILED',
  LEAD_RESTORE_FAILED = 'LEAD_RESTORE_FAILED',
  LEAD_NUMBER_GENERATION_FAILED = 'LEAD_NUMBER_GENERATION_FAILED',
  INVALID_LEAD_DATA = 'INVALID_LEAD_DATA',
}

export const generateLeadExceptionMessage = (
  key: LeadExceptionMessageKey,
  details?: string,
): string => {
  const messages: Record<LeadExceptionMessageKey, string> = {
    [LeadExceptionMessageKey.LEAD_NOT_FOUND]: `Lead not found${details ? `: ${details}` : ''}`,
    [LeadExceptionMessageKey.LEAD_DUPLICATION_FAILED]: `Failed to duplicate lead${details ? `: ${details}` : ''}`,
    [LeadExceptionMessageKey.LEAD_RESTORE_FAILED]: `Failed to restore lead${details ? `: ${details}` : ''}`,
    [LeadExceptionMessageKey.LEAD_NUMBER_GENERATION_FAILED]: `Failed to generate lead number${details ? `: ${details}` : ''}`,
    [LeadExceptionMessageKey.INVALID_LEAD_DATA]: `Invalid lead data${details ? `: ${details}` : ''}`,
  };

  return messages[key];
};
