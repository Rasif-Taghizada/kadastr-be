import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = [
  {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
];
