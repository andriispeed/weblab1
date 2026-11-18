import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import {
  chromium,
  request,
} from "../design/figma-plugin/node_modules/playwright/index.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base =
  process.env.SITE_URL || "https://telegrambot.vps.webdock.cloud/it-school/";
const origin = new URL(base).origin;
const credentials = JSON.parse(
  (await readFile(resolve(root, ".private/admin-access.json"), "utf8")).replace(
    /^\uFEFF/,
    "",
  ),
);
await mkdir(resolve(root, "qa"), { recursive: true });
const api = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: origin },
});
const anonymous = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: origin },
});
const results = [];
const ownedIds = [];
let csrf;
let originalCourse;
let courseChanged = false;
const log = (name) => {
  results.push({ name, passed: true });
  console.log("PASS " + name);
};
const ok = async (response, status = 200) => {
  assert.equal(
    response.status(),
    status,
    `${response.url()}: ${await response.text()}`,
  );
  return response.json();
};
let browser;
try {
  assert.equal((await api.get("api/health")).status(), 200);
  const courses = await ok(await api.get("api/courses"));
  assert.equal(courses.length, 3);
  log("Health and 3 persisted courses");
  assert.equal((await anonymous.get("api/admin/applications")).status(), 401);
  assert.equal(
    (
      await anonymous.patch("api/courses/python", { data: { price: 1 } })
    ).status(),
    404,
  );
  log("Anonymous admin access denied");
  const login = await ok(
    await api.post("api/auth/login", {
      data: { username: credentials.username, password: credentials.password },
    }),
  );
  csrf = login.csrf;
  const sessionCookie = (await api.storageState()).cookies.find(
    (c) => c.name === "it_school_session",
  );
  assert(
    sessionCookie.httpOnly &&
      sessionCookie.secure &&
      sessionCookie.sameSite === "Strict",
  );
  log("Admin login and secure HttpOnly session");
  const testName = "QA " + Date.now();
  const payload = {
    requestId: crypto.randomUUID(),
    name: testName,
    email: "demo@example.com",
    course: "python",
    message: "Автоматична перевірка. Лише вигадані дані.",
    consent: true,
  };
  assert.equal(
    (
      await anonymous.post("api/applications", {
        data: { ...payload, consent: false },
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await anonymous.post("api/applications", {
        data: { ...payload, email: "not-an-email" },
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await anonymous.post("api/applications", {
        data: payload,
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
    403,
  );
  const receipt = await ok(
    await anonymous.post("api/applications", { data: payload }),
    201,
  );
  ownedIds.push(receipt.id);
  const duplicate = await ok(
    await anonymous.post("api/applications", { data: payload }),
    201,
  );
  assert.equal(duplicate.id, receipt.id);
  assert.equal(
    (
      await anonymous.post("api/applications", {
        data: { ...payload, name: "Інше ім’я" },
      })
    ).status(),
    409,
  );
  log("Validation, Origin checks and idempotent submission");
  assert.equal(
    (
      await api.patch("api/admin/applications/" + receipt.id, {
        data: { status: "enrolled" },
      })
    ).status(),
    403,
  );
  assert.equal(
    (
      await api.patch("api/admin/applications/" + receipt.id, {
        headers: { "X-CSRF-Token": csrf },
        data: { status: "invalid" },
      })
    ).status(),
    400,
  );
  const changed = await ok(
    await api.patch("api/admin/applications/" + receipt.id, {
      headers: { "X-CSRF-Token": csrf },
      data: { status: "contacted" },
    }),
  );
  assert.equal(changed.status, "contacted");
  const list = await ok(
    await api.get("api/admin/applications", {
      params: { q: testName, status: "contacted" },
    }),
  );
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].id, receipt.id);
  log("CSRF protection, status update and persisted admin filters");
  originalCourse = await ok(await api.get("api/courses/python"));
  const edited = await ok(
    await api.patch("api/admin/courses/python", {
      headers: { "X-CSRF-Token": csrf },
      data: {
        price: originalCourse.price + 1,
        description: originalCourse.description,
        version: originalCourse.version,
      },
    }),
  );
  courseChanged = true;
  assert.equal(edited.price, originalCourse.price + 1);
  assert.equal(
    (
      await api.patch("api/admin/courses/python", {
        headers: { "X-CSRF-Token": csrf },
        data: {
          price: originalCourse.price,
          description: originalCourse.description,
          version: originalCourse.version,
        },
      })
    ).status(),
    409,
  );
  assert.equal(
    (await ok(await anonymous.get("api/courses/python"))).price,
    originalCourse.price + 1,
  );
  log("Course edits are public; stale edits rejected");
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));
  const screens = [];
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "",
      "courses",
      "courses/python",
      "courses/frontend",
      "courses/qa",
      "contact",
      "design",
      "admin/login",
    ]) {
      await page.goto(base + path);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector(".site-header"))
            .borderBottomStyle === "solid",
      );
      assert.equal(
        await page
          .locator("h1")
          .evaluate((e) =>
            getComputedStyle(e).backgroundImage.includes("linear-gradient"),
          ),
        true,
        "Heading gradient/styles must load",
      );
      if (path === "") await page.locator("app-course-card").first().waitFor();
      if (path === "courses")
        await page.locator("app-course-card").first().waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert(!overflow, `${path} overflows at ${width}`);
      if (
        ["", "courses", "contact"].includes(path) &&
        [390, 768, 1440].includes(width)
      )
        await page.screenshot({
          path: resolve(root, "qa", `angular-${path || "home"}-${width}.png`),
          fullPage: true,
        });
      screens.push({ path, width, overflow });
    }
  }
  log("40 public page/viewport checks without horizontal overflow");
  await page.goto(base + "courses");
  await page.locator("app-course-card").nth(2).waitFor();
  await page.getByRole("button", { name: "Тестування", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll("app-course-card").length === 1,
  );
  assert.equal(await page.locator("app-course-card").count(), 1);
  await page.getByRole("button", { name: "Усі курси", exact: true }).click();
  await page.getByLabel("Пошук курсу або технології").fill("nothing-matches");
  await page
    .getByRole("heading", { name: "Такого курсу поки немає" })
    .waitFor();
  await page.getByRole("button", { name: "Скинути фільтри" }).click();
  await page.locator("app-course-card").nth(2).waitFor();
  assert.equal(await page.locator("app-course-card").count(), 3);
  log("Catalog filters, search and empty state");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("button", { name: "Відкрити меню" }).click();
  await page.locator("#menu-toggle[aria-expanded=true]").waitFor();
  assert.equal(
    await page.locator("#menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  await page.locator("#menu-toggle[aria-expanded=false]").waitFor();
  assert.equal(
    await page.locator("#menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  log("Mobile menu and Escape focus");
  await page.goto(base + "contact?course=qa");
  await page
    .locator("#student-course option[value=qa]")
    .waitFor({ state: "attached" });
  assert.equal(await page.locator("#student-course").inputValue(), "qa");
  await page.getByRole("button", { name: "Надіслати заявку" }).click();
  await page.locator(".form-error-summary").waitFor();
  const browserName = "Browser QA " + Date.now();
  await page.getByLabel("Твоє ім’я").fill(browserName);
  await page.locator("#student-email").fill("browser-demo@example.com");
  await page
    .getByLabel("Твої запитання")
    .fill("Перевірка шляху: телефон → сервер → панель команди.");
  await page.locator("#student-consent").check();
  const responsePromise = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/applications") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Надіслати заявку" }).click();
  const browserReceipt = await ok(await responsePromise, 201);
  ownedIds.push(browserReceipt.id);
  await page.getByRole("heading", { name: "Перший крок зроблено." }).waitFor();
  log("Mobile Reactive Form submits to PostgreSQL");
  const admin = await context.newPage();
  admin.on("pageerror", (e) => jsErrors.push(e.message));
  await admin.setViewportSize({ width: 1440, height: 1000 });
  await admin.goto(base + "admin");
  await admin.getByLabel("Логін", { exact: true }).fill(credentials.username);
  await admin.getByLabel("Пароль", { exact: true }).fill(credentials.password);
  await admin.getByRole("button", { name: "Увійти", exact: false }).click();
  await admin.getByRole("heading", { name: "Панель команди." }).waitFor();
  await admin.getByLabel("Знайти заявку").fill(browserName);
  await admin.getByRole("button", { name: "Застосувати", exact: true }).click();
  const row = admin.locator(`[data-id="${browserReceipt.id}"]`);
  await row.waitFor();
  await row.locator("select").selectOption("enrolled");
  await admin.getByText("Статус заявки оновлено.", { exact: true }).waitFor();
  await admin.reload();
  await admin.locator(`[data-id="${browserReceipt.id}"] select`).waitFor();
  assert.equal(
    await admin.locator(`[data-id="${browserReceipt.id}"] select`).inputValue(),
    "enrolled",
  );
  await admin.screenshot({
    path: resolve(root, "qa", "angular-admin-1440.png"),
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await admin.setViewportSize({ width, height: 900 });
    assert(
      !(await admin.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )),
    );
  }
  log(
    "Admin sees mobile submission; status survives reload; 4 admin viewports",
  );
  await admin.setViewportSize({ width: 1440, height: 900 });
  await admin.getByRole("button", { name: "Курси", exact: true }).click();
  await admin.locator("#price-python").waitFor();
  await admin.locator("#price-python").fill(String(originalCourse.price + 2));
  const courseForm = admin
    .locator("form")
    .filter({ has: admin.locator("#price-python") });
  await courseForm.getByRole("button", { name: "Зберегти зміни" }).click();
  await admin
    .getByText("Курс оновлено. Зміни вже доступні в каталозі.")
    .waitFor();
  assert.equal(
    (await ok(await api.get("api/courses/python"))).price,
    originalCourse.price + 2,
  );
  log("Admin course editor changes actual API data");
  await page.goto(base + "design");
  await page
    .getByRole("button", { name: "Вимога замовника", exact: true })
    .click();
  await page.locator(".design-sample.gradient-full").waitFor();
  assert(
    await page
      .locator(".design-sample")
      .evaluate((e) =>
        getComputedStyle(e.querySelector("p")).backgroundImage.includes(
          "linear-gradient",
        ),
      ),
  );
  await page
    .getByRole("button", { name: "Наш компроміс", exact: true })
    .click();
  await page.locator(".design-sample.gradient-titles").waitFor();
  assert.equal(
    await page
      .locator(".design-sample")
      .evaluate((e) => getComputedStyle(e.querySelector("p")).backgroundImage),
    "none",
  );
  await page.goto(base);
  await page.emulateMedia({ forcedColors: "active" });
  assert.notEqual(
    await page
      .locator("h1")
      .evaluate((e) => getComputedStyle(e).webkitTextFillColor),
    "rgba(0, 0, 0, 0)",
  );
  await page.emulateMedia({ forcedColors: "none" });
  log("CR15 comparison and forced-colors fallback");
  await page.goto(base + "design-preview/");
  await page.locator('#artboard[data-screen="Desktop.home"]').waitFor();
  assert((await page.locator(".cr-gradient").count()) > 0);
  log("Published design preview loads under CSP");
  await page.goto(base + "api/docs/");
  await page.locator(".swagger-ui").first().waitFor();
  log("Published Swagger documentation");
  assert.deepEqual(jsErrors, []);
  log("No browser JavaScript errors");
  await writeFile(
    resolve(root, "qa/live-report.json"),
    JSON.stringify(
      { testedAt: new Date().toISOString(), base, results, screens, jsErrors },
      null,
      2,
    ),
  );
} finally {
  if (csrf) {
    if (courseChanged && originalCourse) {
      const current = await ok(await api.get("api/courses/python"));
      await ok(
        await api.patch("api/admin/courses/python", {
          headers: { "X-CSRF-Token": csrf },
          data: {
            price: originalCourse.price,
            description: originalCourse.description,
            version: current.version,
          },
        }),
      );
    }
    for (const id of ownedIds)
      await ok(
        await api.delete("api/admin/applications/" + id, {
          headers: { "X-CSRF-Token": csrf },
        }),
      );
    await api.post("api/auth/logout", {
      data: {},
      headers: { "X-CSRF-Token": csrf },
    });
  }
  await browser?.close();
  await api.dispose();
  await anonymous.dispose();
}
