import { SwaggerRouter } from "../router";
import path from "path";

export default (app: any) => {
  const router = new SwaggerRouter();
  router.swagger({
    swaggerHtmlEndpoint: "/docs",
    swaggerJsonEndpoint: "/swagger.json"
  });
  router.mapDir(path.join(__dirname, "./controller"));
  return router;
};
