import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const tokens = JSON.parse(
  await readFile(new URL("design/tokens.json", root), "utf8"),
);
await writeFile(
  new URL("design/figma-plugin/src/tokens.generated.ts", root),
  `// Generated from design/tokens.json.\nexport const tokens = ${JSON.stringify(tokens, null, 2)} as const;\n`,
);
const vars = Object.entries(tokens.colors).map(([k, v]) => `  --${k}: ${v};`);
vars.push(
  ...tokens.gradient.dark.map((v, i) => `  --gradient-${i + 1}: ${v};`),
  `  --gradient-fallback: ${tokens.colors.primary};`,
  `  --radius: ${tokens.radius}px;`,
);
await mkdir(new URL("frontend/src/styles/", root), { recursive: true });
await writeFile(
  new URL("frontend/src/styles/_tokens.scss", root),
  `/* Generated from design/tokens.json. */\n:root {\n${vars.join("\n")}\n}\n`,
);
await mkdir(new URL("frontend/public/assets/", root), { recursive: true });
for (const name of ["InterVariable.woff2", "Inter-LICENSE.txt", "favicon.svg"])
  await copyFile(
    new URL("legacy/static/assets/" + name, root),
    new URL("frontend/public/assets/" + name, root),
  );
console.log("Design tokens and local font prepared.");
