import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function AtLeastOneOf(fields: string[], options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'atLeastOneOf',
      target: (object as any).constructor,
      propertyName,
      options: { message: `At least one of [${fields.join(', ')}] must be provided`, ...options },
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          return fields.some((f) => obj[f] !== undefined && obj[f] !== null && obj[f] !== '');
        },
      },
    });
  };
}
