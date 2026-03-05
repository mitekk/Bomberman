import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? "3000");
const app = buildApp();

app.listen(port, () => {
  process.stdout.write(`backend listening on ${port}\n`);
});
