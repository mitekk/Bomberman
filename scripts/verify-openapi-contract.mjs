import { readFileSync } from "node:fs";

const openapi = readFileSync("backend/openapi.yaml", "utf8");
const router = readFileSync("backend/src/api/router.ts", "utf8");

const required = [
  { method: "get", path: "/health", routerPath: "/health" },
  { method: "post", path: "/api/v1/rounds", routerPath: "/api/v1/rounds" },
  { method: "get", path: "/api/v1/rounds/{roundId}", routerPath: "/api/v1/rounds/:roundId" },
  { method: "post", path: "/api/v1/commands", routerPath: "/api/v1/commands" },
  { method: "get", path: "/api/v1/profile", routerPath: "/api/v1/profile" },
  { method: "patch", path: "/api/v1/profile", routerPath: "/api/v1/profile" },
];

const errors = [];

for (const item of required) {
  const openapiPathPattern = new RegExp(`^\\s{2}${item.path.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}:\\s*$`, "m");
  if (!openapiPathPattern.test(openapi)) {
    errors.push(`OpenAPI missing path: ${item.path}`);
  }

  const methodInPathPattern = new RegExp(
    `${item.path.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}:\\n(?:[\\s\\S]{0,120}?\\n)?\\s{4}${item.method}:`,
    "m",
  );
  if (!methodInPathPattern.test(openapi)) {
    errors.push(`OpenAPI missing method ${item.method.toUpperCase()} for ${item.path}`);
  }

  const routerPattern = new RegExp(`apiRouter\\.${item.method}\\(\\"${item.routerPath.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\"`);
  if (!routerPattern.test(router)) {
    errors.push(`Router missing handler ${item.method.toUpperCase()} ${item.routerPath}`);
  }
}

if (errors.length > 0) {
  console.error("OpenAPI contract regression detected:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log("OpenAPI contract check passed.");
