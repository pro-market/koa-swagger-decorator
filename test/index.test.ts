import { initKoaApp } from "../src/example/app";
import request from "supertest";

describe("decorator test", () => {
  it("works", async () => {
    await request(initKoaApp().callback())
      .get("/test")
      .expect(200);
  });
  it("should success handle @request", async () => {
    await request(initKoaApp().callback())
      .get("/demo")
      .expect(200);
  });
});

describe("swagger test", () => {
  it("should generates swagger json", async () => {
    const res = await request(initKoaApp().callback()).get("/swagger.json");
    expect(Object.keys(JSON.parse(res.text).paths).length).toBeGreaterThan(1);
  });
});
