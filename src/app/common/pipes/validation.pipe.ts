import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  Optional,
  Type,
  Inject,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(@Optional() @Inject(I18nService) private readonly i18n?: I18nService) {}

  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => {
        const constraints = error.constraints || {};
        return {
          property: error.property,
          errors: Object.values(constraints).map((message) => {
            // Only try to translate if i18n service is properly initialized
            if (this.i18n && typeof this.i18n.translate === 'function' && message.includes('.')) {
              try {
                return this.i18n.translate(message);
              } catch (e) {
                return message;
              }
            }
            return message;
          }),
        };
      });

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        message: validationErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
