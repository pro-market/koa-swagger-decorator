import { description, request, body, query, queryAll, tags } from "../..";

@queryAll({
  all: { type: "number" }
})
export default class DemoController {
  @request("get", "/demo")
  @description("this is demo")
  @tags(["haha"])
  async demo(ctx: any) {
    ctx.body = {
      msg: "demo"
    };
  }

  @request("get", "/test")
  @description("this is test")
  @query({
    a: { type: "number" }
  })
  @tags(["hh"])
  async test(ctx: any) {
    ctx.body = {
      msg: "test",
      b: ctx.validatedQuery
    };
  }

  @request("post", "/testpost")
  @description("this is post test")
  @body({
    a: { type: "number", example: 33 },
    b: {
      type: "object"
    }
  })
  @tags(["hh"])
  async posttest(ctx: any) {
    ctx.body = {
      msg: "testpost",
      ctx,
      b: ctx.request.body
    };
  }
}
