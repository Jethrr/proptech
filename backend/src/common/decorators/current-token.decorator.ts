import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    const [, token] = (request.headers.authorization ?? '').split(' ');
    return token ?? '';
  },
);
