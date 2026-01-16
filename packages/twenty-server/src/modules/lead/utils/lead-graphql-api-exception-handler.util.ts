import { assertUnreachable } from 'twenty-shared/utils';

import {
  type LeadException,
  LeadExceptionCode,
} from 'src/modules/lead/exceptions/lead.exception';
import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const leadGraphqlApiExceptionHandler = (exception: LeadException) => {
  switch (exception.code) {
    case LeadExceptionCode.LEAD_NOT_FOUND:
      throw new NotFoundError(exception);
    case LeadExceptionCode.INVALID_LEAD_DATA:
      throw new UserInputError(exception);
    case LeadExceptionCode.LEAD_DUPLICATION_FAILED:
    case LeadExceptionCode.LEAD_RESTORE_FAILED:
    case LeadExceptionCode.LEAD_NUMBER_GENERATION_FAILED:
      throw new InternalServerError(exception);
    default:
      assertUnreachable(exception.code);
  }
};
