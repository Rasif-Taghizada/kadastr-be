import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseEnumPipe<T extends object> implements PipeTransform {
  constructor(private readonly enumType: T) {}

  transform(value: string) {
    const valid = Object.values(this.enumType) as string[];
    if (!valid.includes(value)) {
      throw new BadRequestException(`Value must be one of: ${valid.join(', ')}`);
    }
    return value;
  }
}
