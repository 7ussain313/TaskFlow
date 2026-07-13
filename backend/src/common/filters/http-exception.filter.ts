import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Converts HttpStatus's SCREAMING_SNAKE_CASE key (e.g. "NOT_FOUND") into Nest's own
// title-case error text ("Not Found"), so every response uses the same casing whether
// Nest generated the error body itself or we're falling back to the status code.
function titleCaseStatusText(statusCode: number): string {
  return HttpStatus[statusCode]
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // Catches every thrown error app-wide and reshapes it into one consistent
  // { statusCode, message, error } JSON response instead of Nest's default format.
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttp ? exception.getResponse() : null;
    const message =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: string | string[] }).message
        : isHttp
          ? exception.message
          : 'Internal server error';
    const error =
      body && typeof body === 'object' && 'error' in body
        ? (body as { error: string }).error
        : titleCaseStatusText(statusCode);

    if (!isHttp) {
      this.logger.error(exception);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}
