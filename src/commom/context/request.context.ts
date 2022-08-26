import * as uuid from 'uuid';
import { Request, Response } from 'express';
import { getNamespace, Namespace } from 'cls-hooked';

export class RequestContext {
  public static readonly NAMESPACE = `${process.env.APP_NAME}`;
  public static readonly REQUEST_ID = 'requestId';
  public static readonly CORRELATION_ID = 'correlationId';

  public request: Request;
  public response: Response;
  public readonly id: string;

  constructor(request: Request, response: Response) {
    this.id = uuid.v4();
    this.request = request;
    this.response = response;
  }

  public static currentRequestNamespace(): Namespace {
    return getNamespace(RequestContext.NAMESPACE);
  }

  public static set(name: string, value: any) {
    const namespace: Namespace = RequestContext.currentRequestNamespace();
    namespace.set(name, value);
  }

  public static get(name: string): any {
    const namespace: Namespace = RequestContext.currentRequestNamespace();
    return namespace.get(name);
  }

  public static currentRequestContext(): RequestContext {
    const namespace: Namespace = RequestContext.currentRequestNamespace();
    return !(namespace === null || namespace === undefined)
      ? namespace.get(RequestContext.REQUEST_ID)
      : null;
  }

  public static currentRequest(): Request {
    let requestContext: RequestContext = RequestContext.currentRequestContext();
    return requestContext.request;
  }

  public static uniqueKeyGenerator(): string {
    return `${process.env.APP_NAME}-${uuid.v4()}`;
  }
}
