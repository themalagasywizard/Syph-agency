import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");

// Everything the static site serves. index.html is the Syph product landing;
// agency.html / agentic-ai.html are the Syph Agency pages.
const FILES = ["index.html", "syph.css", "syph.js", "agency.html", "agentic-ai.html", "styles.css", "script.js"];

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  for (const f of FILES) await cp(path.join(projectRoot, f), path.join(distDir, f));
  await cp(path.join(projectRoot, "assets"), path.join(distDir, "assets"), { recursive: true });
  console.log(`Built static site into ${path.relative(projectRoot, distDir)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
