// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from 'modules/database/entities/user.entity';

export const UserSession = createParamDecorator((_: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user; // Access the session attached by the interceptor
});
