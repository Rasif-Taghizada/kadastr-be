import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, body, params, query } = req;
    const userAgent = req.headers['user-agent'] ?? '-';
    const userId = (req as any).user?.id ?? 'anonymous';
    const start = Date.now();

    this.logger.log(this.formatIncoming({ method, url, userId, ip, userAgent, body, params, query }));

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(this.formatSuccess({ method, url, statusCode: res.statusCode, ms, userId }));
      }),
      catchError((err) => {
        const ms = Date.now() - start;
        const statusCode = err?.status ?? err?.statusCode ?? 500;
        this.logger.error(
          this.formatError({ method, url, statusCode, ms, userId, message: err?.message }),
        );
        return throwError(() => err);
      }),
    );
  }

  // ─── Formatters ────────────────────────────────────────────────────────────

  private formatIncoming(data: {
    method: string;
    url: string;
    userId: string;
    ip: string;
    userAgent: string;
    body: Record<string, unknown>;
    params: Record<string, unknown>;
    query: Record<string, unknown>;
  }): string {
    const lines = [
      ``,
      `  ┌─ Incoming Request`,
      `  │  ${data.method} ${data.url}`,
      `  │  User     : ${data.userId}`,
      `  │  IP       : ${data.ip}`,
      `  │  Agent    : ${this.truncate(data.userAgent, 60)}`,
    ];

    if (Object.keys(data.params).length) {
      lines.push(`  │  Params   : ${JSON.stringify(data.params)}`);
    }
    if (Object.keys(data.query).length) {
      lines.push(`  │  Query    : ${JSON.stringify(data.query)}`);
    }
    if (data.body && Object.keys(data.body).length) {
      lines.push(`  │  Body     : ${JSON.stringify(data.body)}`);
    }

    lines.push(`  └─────────────────────────────`);
    return lines.join('\n');
  }

  private formatSuccess(data: {
    method: string;
    url: string;
    statusCode: number;
    ms: number;
    userId: string;
  }): string {
    const speed = this.speedLabel(data.ms);
    return [
      ``,
      `  ┌─ Response  ✓`,
      `  │  ${data.method} ${data.url}`,
      `  │  Status  : ${data.statusCode}`,
      `  │  User    : ${data.userId}`,
      `  │  Time    : ${data.ms}ms  ${speed}`,
      `  └─────────────────────────────`,
    ].join('\n');
  }

  private formatError(data: {
    method: string;
    url: string;
    statusCode: number;
    ms: number;
    userId: string;
    message: string;
  }): string {
    return [
      ``,
      `  ┌─ Response  ✗`,
      `  │  ${data.method} ${data.url}`,
      `  │  Status  : ${data.statusCode}`,
      `  │  User    : ${data.userId}`,
      `  │  Time    : ${data.ms}ms`,
      `  │  Error   : ${data.message}`,
      `  └─────────────────────────────`,
    ].join('\n');
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Labels response time so slow endpoints are immediately obvious. */
  private speedLabel(ms: number): string {
    if (ms < 100) return '⚡ fast';
    if (ms < 500) return '✓ ok';
    if (ms < 1500) return '⚠ slow';
    return '🔴 very slow';
  }

  private truncate(str: string, max: number): string {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }
}
