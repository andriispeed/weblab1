import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
if (!process.env.DB_NAME?.endsWith("_test"))
  throw new Error(
    "Integration tests require a disposable database ending in _test",
  );
const password = randomBytes(24).toString("hex");
const server = spawn(process.execPath, ["dist/main.js"], {
  cwd: process.env.API_TEST_ROOT || new URL("../", import.meta.url),
  env: {
    ...process.env,
    PORT: "3310",
    PUBLIC_URL: "http://localhost:4200/it-school/",
    COOKIE_SECURE: "false",
    ADMIN_INITIAL_PASSWORD: password,
    ADMIN_USERNAME: "ci-admin",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (d) => (serverOutput += d));
server.stderr.on("data", (d) => (serverOutput += d));
const url = "http://127.0.0.1:3310/api/";
let cookie = "",
  csrf = "";
async function call(path, method = "GET", body, auth = false) {
  return fetch(url + path, {
    method,
    headers: {
      Origin: "http://localhost:4200",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
try {
  let healthy = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await call("health")).ok) {
        healthy = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert(healthy, "API did not start: " + serverOutput);
  assert.equal((await (await call("courses")).json()).length, 3);
  assert.equal((await call("admin/applications")).status, 401);
  const login = await call("auth/login", "POST", {
    username: "ci-admin",
    password,
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  csrf = (await login.json()).csrf;
  const data = {
    requestId: randomUUID(),
    name: "CI Student",
    email: "ci@example.com",
    course: "qa",
    message: "Disposable integration test",
    consent: true,
  };
  assert.equal(
    (await call("applications", "POST", { ...data, consent: false })).status,
    400,
  );
  const receipt = await (await call("applications", "POST", data)).json();
  assert(receipt.id);
  assert.equal(
    (await (await call("applications", "POST", data)).json()).id,
    receipt.id,
  );
  assert.equal(
    (
      await call(
        "admin/applications/" + receipt.id,
        "PATCH",
        { status: "enrolled" },
        true,
      )
    ).status,
    200,
  );
  const list = await (
    await call("admin/applications?status=enrolled", "GET", undefined, true)
  ).json();
  assert.equal(list.items[0].id, receipt.id);
  assert.equal(
    (await call("admin/applications/" + receipt.id, "DELETE", undefined, true))
      .status,
    200,
  );
  await call("auth/logout", "POST", {}, true);
  assert.equal(
    (await call("admin/applications", "GET", undefined, true)).status,
    401,
  );
  console.log(
    "PASS isolated PostgreSQL integration: migrations, authentication, validation, idempotency, status, deletion, logout.",
  );
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((resolve) => server.once("exit", resolve));
  }
}
