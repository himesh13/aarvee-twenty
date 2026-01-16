import { Catch, type ExceptionFilter } from '@nestjs/common';

import { LeadException } from 'src/modules/lead/exceptions/lead.exception';
import { leadGraphqlApiExceptionHandler } from 'src/modules/lead/utils/lead-graphql-api-exception-handler.util';

@Catch(LeadException)
export class LeadGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: LeadException) {
    return leadGraphqlApiExceptionHandler(exception);
  }
}
