import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONTENT_DIR = path.resolve("content");

async function walkMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkMarkdownFiles(fullPath);
      }

      return entry.isFile() && fullPath.endsWith(".md") ? [fullPath] : [];
    }),
  );

  return files.flat();
}

function hasDraftFrontmatter(source) {
  if (!source.startsWith("---")) {
    return false;
  }

  const end = source.indexOf("\n---", 3);
  if (end === -1) {
    return false;
  }

  const frontmatter = source.slice(3, end);
  return /^\s*draft\s*:\s*true\s*$/im.test(frontmatter);
}

async function getLintableMarkdownFiles() {
  const markdownFiles = await walkMarkdownFiles(CONTENT_DIR);
  const lintableFiles = [];

  for (const file of markdownFiles) {
    const source = await readFile(file, "utf8");

    if (!hasDraftFrontmatter(source)) {
      lintableFiles.push(path.relative(process.cwd(), file));
    }
  }

  return lintableFiles.sort();
}

async function main() {
  const files = await getLintableMarkdownFiles();

  if (process.argv.includes("--count")) {
    process.stdout.write(`${files.length}\n`);
    return;
  }

  process.stdout.write(JSON.stringify(files));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
