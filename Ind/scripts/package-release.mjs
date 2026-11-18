import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const id = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+$/, "")
  .replace("T", "-");
const target = resolve(root, "releases", id);
await mkdir(target, { recursive: true });
await cp(resolve(root, "frontend/dist/browser"), resolve(target, "frontend"), {
  recursive: true,
});
await mkdir(resolve(target, "backend"), { recursive: true });
for (const name of ["dist", "package.json", "package-lock.json"])
  await cp(resolve(root, "backend", name), resolve(target, "backend", name), {
    recursive: true,
  });
await cp(resolve(root, "infra"), resolve(target, "infra"), {
  recursive: true,
  filter: (path) => !path.endsWith(".env"),
});
await cp(resolve(root, "infra/compose.yaml"), resolve(target, "compose.yaml"));
await mkdir(resolve(target, "frontend/design-preview"), { recursive: true });
// The standalone preview uses a generated inline script. Externalize it for CSP.
let preview = await readFile(
  resolve(root, "design/change-request.html"),
  "utf8",
);
let index = 0;
const scripts = [];
preview = preview.replace(/<script>([\s\S]*?)<\/script>/g, (_, code) => {
  const filename = `preview-${index++}.js`;
  // Queue writes below so packaging finishes only after all files exist.
  scripts.push([filename, code]);
  return `<script src="${filename}" defer></script>`;
});
async function finish() {
  for (const [name, code] of scripts)
    await writeFile(resolve(target, "frontend/design-preview", name), code);
}
await finish();
await writeFile(resolve(target, "frontend/design-preview/index.html"), preview);
await writeFile(
  resolve(target, "release.json"),
  JSON.stringify(
    {
      id,
      builtAt: new Date().toISOString(),
      frontend: "Angular 20.3",
      backend: "NestJS",
    },
    null,
    2,
  ),
);
execFileSync("tar", [
  "-czf",
  resolve(root, "releases", id + ".tar.gz"),
  "-C",
  target,
  ".",
]);
await writeFile(
  resolve(root, "releases/latest.json"),
  JSON.stringify(
    {
      id,
      directory: target,
      archive: resolve(root, "releases", id + ".tar.gz"),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({ id, archive: resolve(root, "releases", id + ".tar.gz") }),
);
