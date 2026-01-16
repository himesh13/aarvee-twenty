import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum LeadExceptionCode {
  LEAD_NOT_FOUND = 'LEAD_NOT_FOUND',
  LEAD_DUPLICATION_FAILED = 'LEAD_DUPLICATION_FAILED',
  LEAD_RESTORE_FAILED = 'LEAD_RESTORE_FAILED',
  LEAD_NUMBER_GENERATION_FAILED = 'LEAD_NUMBER_GENERATION_FAILED',
  INVALID_LEAD_DATA = 'INVALID_LEAD_DATA',
}

const getLeadExceptionUserFriendlyMessage = (
  code: LeadExceptionCode,
) => {
  switch (code) {
    case LeadExceptionCode.LEAD_NOT_FOUND:
      return msg`Lead not found.`;
    case LeadExceptionCode.LEAD_DUPLICATION_FAILED:
      return msg`Failed to duplicate lead.`;
    case LeadExceptionCode.LEAD_RESTORE_FAILED:
      return msg`Failed to restore lead.`;
    case LeadExceptionCode.LEAD_NUMBER_GENERATION_FAILED:
      return msg`Failed to generate lead number.`;
    case LeadExceptionCode.INVALID_LEAD_DATA:
      return msg`Invalid lead data.`;
    default:
      assertUnreachable(code);
  }
};

export class LeadException extends CustomException<LeadExceptionCode> {
  constructor(
    message: string,
    code: LeadExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getLeadExceptionUserFriendlyMessage(code),
    });
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
