import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse() as Record<
      string,
      unknown
    >;
    const errorMessage =
      (exceptionResponse.message as string) || exception.message;
    const errorName = (exceptionResponse.error as string) || 'Error';
    const lang = request.headers['accept-language'] || 'en';

    // Try to translate error message if it's a key
    let translatedMessage = errorMessage;
    if (typeof errorMessage === 'string' && errorMessage.includes('.')) {
      try {
        translatedMessage = await this.i18n.translate(errorMessage, { lang });
      } catch {
        // If translation fails, use the original message
      }
    }

    // Log the exception
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(
        translatedMessage,
      )}`,
      exception.stack,
    );

    // Return standardized error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorName,
      message: translatedMessage,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      ...(status === HttpStatus.UNPROCESSABLE_ENTITY && {
        validation: exceptionResponse.message as string[],
      }),
    });
  }
}
