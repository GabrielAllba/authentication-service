import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseResponse } from '../interceptor/response-mapping.interceptor';

@Catch()
export class BaseExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (
      exception instanceof BadRequestException ||
      exception instanceof HttpException
    ) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const msg = (response as any).message;
        message = Array.isArray(msg) ? msg.join('; ') : msg;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: BaseResponse<null> = {
      status: 'error',
      message,
      data: null,
    };

    res.status(status).json(errorResponse);
  }
}
