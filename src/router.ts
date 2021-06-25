import Router from "@koa/router";
import { OpenAPIDecorator } from "openapi-decorators/dist/core";
import {
  reservedMethodNames,
  loadSwaggerClasses
} from "openapi-decorators/dist/core/utils";
import { koaSwagger } from "koa2-swagger-ui";
import { BasicMeta } from "openapi-decorators/dist/types";

export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  swaggerJsonEndpoint?: string;
  swaggerHtmlEndpoint?: string;
  prefix?: string;
  swaggerOptions?: any;
  swaggerUIOptions?: any; // config for koa2-swagger-ui
  [name: string]: any;
}

export interface DumpOptions {
  dir: string;
  filename: string;
}

export interface MapOptions {
  doValidation?: boolean;
  recursive?: boolean;
  [name: string]: any;
  ignore?: string[];
}

export class SwaggerRouter<StateT = any, CustomT = {}> extends Router {
  public swaggerKeys: Set<String>;
  public opts: Router.RouterOptions;
  public swaggerOpts: SwaggerOptions;
  openAPIDecorator: OpenAPIDecorator;
  meta: BasicMeta;

  constructor(
    opts: Router.RouterOptions = {},
    swaggerOpts: SwaggerOptions = {}
  ) {
    super(opts);
    this.opts = opts || {}; // koa-router opts
    this.swaggerKeys = new Set();
    this.swaggerOpts = swaggerOpts || {}; // swagger-router opts
    this.openAPIDecorator = new OpenAPIDecorator();
    this.meta = this.openAPIDecorator.createMetaSchema();

    if (this.opts.prefix && !this.swaggerOpts.prefix) {
      this.swaggerOpts.prefix = this.opts.prefix;
    }
  }

  init() {
    // apply routes based on meta
    Object.entries(this.meta).forEach(([metaKey, metaItem]) => {
      const { path, method } = metaItem.request!;
      (this as any)[method](path, (ctx: any) =>
        new metaItem.target.constructor()[metaItem.propertyKey!](ctx)
      );
    });
  }

  swagger(options: SwaggerOptions = {}) {
    const opts = Object.assign(options, this.swaggerOpts);

    const {
      swaggerJsonEndpoint = "/swagger-json",
      swaggerHtmlEndpoint = "/swagger-html"
    } = options;

    // setup swagger router
    this.get(swaggerJsonEndpoint, async (ctx: any) => {
      ctx.body = this.openAPIDecorator.createSwaggerJSON(options);
    });

    this.get(
      swaggerHtmlEndpoint,
      koaSwagger({
        routePrefix: false,
        ...options.swaggerUIOptions,
        swaggerOptions: {
          ...(options.swaggerUIOptions?.swaggerOptions || {}),
          url: swaggerJsonEndpoint
        }
      })
    );
  }

  dumpSwaggerJson(dumpOptions: DumpOptions, options: SwaggerOptions = {}) {
    const opts = Object.assign(options, this.swaggerOpts);
    // handleDumpSwaggerJSON(this, dumpOptions, opts);
  }

  map(SwaggerClass: any, options: MapOptions) {
    handleMap(this, SwaggerClass, options);
  }

  mapDir(dir: string, options: MapOptions = {}) {
    // import controllers
    loadSwaggerClasses(dir, options);

    Object.entries(this.meta).forEach(([metaKey, metaItem]) => {
      if (!metaItem.request) return;

      const { path, method } = metaItem.request;

      if (!path || !method) return;

      (this as any)[method](path, (ctx: any) =>
        new metaItem.target.constructor()[metaItem.propertyKey!](ctx)
      );
    });
  }

  // compose & create a middleware for validator & @middlewares decorators
  buildMiddleware(SwaggerClass: any, options: MapOptions) {
    // return handleBuildMiddleware(this, SwaggerClass, options)
  }
}

const handleMap = (
  router: SwaggerRouter,
  SwaggerClass: any,
  { doValidation = true }
) => {
  if (!SwaggerClass) return;

  const SwaggerClassPrototype = SwaggerClass.prototype;
  const methods = Object.getOwnPropertyNames(SwaggerClassPrototype)
    .filter(method => !reservedMethodNames.includes(method))
    .map(method => {
      const wrapperMethod = async (ctx: any) => {
        const c = new SwaggerClass(ctx);
        await c[method](ctx);
      };
      // 添加了一层 wrapper 之后，需要把原函数的名称暴露出来 fnName
      // wrapperMethod 继承原函数的 descriptors
      const descriptors = Object.getOwnPropertyDescriptors(
        SwaggerClassPrototype[method]
      );
      Object.defineProperties(wrapperMethod, {
        fnName: {
          value: method,
          enumerable: true,
          writable: true,
          configurable: true
        },
        ...descriptors
      });
      return wrapperMethod;
    });

  // map all methods
  methods
    // filter methods withour @request decorator
    .filter((item: any) => {
      const { path, method } = item;
      if (!path && !method) {
        return false;
      }
      return true;
    })
    // add router
    .forEach((item: any) => {
      console.log(">>>>", item, Reflect.getMetadata(item.fnName, SwaggerClass));
    });
};
