import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import { RequestContext } from '../commom/context/request.context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction): any {
    let reqContext = new RequestContext(req, res);

    const namespace: Namespace =
      getNamespace(RequestContext.NAMESPACE) ||
      createNamespace(RequestContext.NAMESPACE);

    namespace.run(() => {
      namespace.set(RequestContext.REQUEST_ID, reqContext.id);
      res.setHeader(RequestContext.REQUEST_ID, reqContext.id);

      if (
        !(
          reqContext.request.get('correlationId') === null ||
          reqContext.request.get('correlationId') === undefined ||
          reqContext.request.get('correlationId').length === 0
        )
      ) {
        namespace.set(
          RequestContext.CORRELATION_ID,
          reqContext.request.get('correlationId'),
        );
      } else {
        namespace.set(
          RequestContext.CORRELATION_ID,
          RequestContext.uniqueKeyGenerator(),
        );
      }
      next();
    });
  }
}