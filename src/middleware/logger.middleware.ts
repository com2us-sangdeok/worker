import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../commom/context/request.context';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent');

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(
        `${RequestContext.get(
          RequestContext.CORRELATION_ID,
        )} ${method} ${originalUrl} ${statusCode} ${ip} ${userAgent}`,
      );
    });
    next();
  }
}