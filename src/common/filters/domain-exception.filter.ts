/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { OutOfStockError } from '../../core/domain/errors/out-of-stock.error';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = host.getArgByIndex(2);
    const isGraphQL = !!gqlHost;

    if (exception instanceof OutOfStockError && isGraphQL) {
      throw new GraphQLError(exception.message, {
        extensions: {
          code: 'OUT_OF_STOCK',
          http: { status: HttpStatus.CONFLICT },
          productId: exception.productId,
        },
      });
    }
    throw exception as any;
  }
}
