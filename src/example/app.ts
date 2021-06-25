import "reflect-metadata";
import Koa from "koa";
import "./controller/demo";
import initRouter from "./router";
import koaBody from "koa-body";
export const initKoaApp = () => {
  const app = new Koa();
  const router = initRouter(app);
  app.use(koaBody());
  app.use(router.routes());
  app.use(ctx => {
    ctx.body = "Hello Koa";
  });

  return app;
};
