import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import {
  LeadException,
  LeadExceptionCode,
} from 'src/modules/lead/exceptions/lead.exception';
import {
  ExceptionHandlerUser,
  handleExceptionAndConvertToGraphQLError,
} from 'src/engine/core-modules/exception-handler/utils/handle-exception-and-convert-to-graphql-error.util';

@Catch(LeadException)
export class LeadGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(exception: LeadException, host: ArgumentsHost) {
    return handleExceptionAndConvertToGraphQLError(
      this.castToGraphQLErrorOrRethrow(exception),
      {
        user: ExceptionHandlerUser.USER,
      },
    );
  }

  private castToGraphQLErrorOrRethrow(
    exception: LeadException,
  ): LeadException {
    const graphQLErrors: Record<LeadExceptionCode, LeadExceptionCode> = {
      LEAD_NOT_FOUND: LeadExceptionCode.LEAD_NOT_FOUND,
      LEAD_DUPLICATION_FAILED: LeadExceptionCode.LEAD_DUPLICATION_FAILED,
      LEAD_RESTORE_FAILED: LeadExceptionCode.LEAD_RESTORE_FAILED,
      LEAD_NUMBER_GENERATION_FAILED:
        LeadExceptionCode.LEAD_NUMBER_GENERATION_FAILED,
      INVALID_LEAD_DATA: LeadExceptionCode.INVALID_LEAD_DATA,
    };

    const exceptionCode = graphQLErrors[exception.code];

    if (!exceptionCode) {
      throw exception;
    }

    return exception;
  }
}
