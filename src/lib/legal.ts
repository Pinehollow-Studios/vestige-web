/**
 * The legal pages render straight from their canonical markdown in legal/
 * (legal/README.md), at build. The file's own H1 becomes the page title, and
 * the editors' note that follows it (a blockquote beginning "Canonical
 * source") is removed: it is for us, never for the public page.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

export type LegalDoc = { title: string; html: string };

export function loadLegal(file: string): LegalDoc {
  const raw = readFileSync(join(process.cwd(), "legal", file), "utf8");
  const lines = raw.split("\n");
  const h1 = lines.findIndex((l) => l.startsWith("# "));
  const title = lines[h1].replace(/^#\s+/, "").replace(/^Vestige\s+[—-]\s+/, "");
  let i = h1 + 1;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (lines[i]?.startsWith("> Canonical source")) {
    while (i < lines.length && lines[i].startsWith(">")) i++;
  }
  const body = lines.slice(i).join("\n");
  return { title, html: marked.parse(body, { async: false, gfm: true }) as string };
}
