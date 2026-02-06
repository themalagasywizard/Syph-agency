import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");

async function main() {
  // Clean + recreate dist
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  // Copy site entrypoints
  await cp(path.join(projectRoot, "index.html"), path.join(distDir, "index.html"));
  await cp(path.join(projectRoot, "styles.css"), path.join(distDir, "styles.css"));
  await cp(path.join(projectRoot, "script.js"), path.join(distDir, "script.js"));

  // Copy assets (if present)
  await cp(path.join(projectRoot, "assets"), path.join(distDir, "assets"), { recursive: true });

  console.log(`Built static site into ${path.relative(projectRoot, distDir)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

