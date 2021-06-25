import { initKoaApp } from "./app";

const app = initKoaApp();

app.listen(4000, () => {
  console.log("listened at 4000");
});
