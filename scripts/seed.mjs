import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { rows } from "../server/database.js";
import { removeLegacyPlaceholders } from "../server/legacy-placeholders.js";
import { validateContent } from "../server/validation.js";

const content = validateContent(JSON.parse(await readFile(new URL("../src/data/content.json",import.meta.url),"utf8")));
await rows("mystic_content?on_conflict=id", {
  method:"POST", body:{id:1,content}, prefer:"resolution=ignore-duplicates,return=minimal",
});
// Compare revisions so cleanup never overwrites simultaneous CMS edits.
for (let attempt = 0; attempt < 3; attempt++) {
  const [record] = await rows("mystic_content?id=eq.1&select=content,revision");
  if (!record) throw new Error("Seeded content row could not be read.");
  const cleaned = removeLegacyPlaceholders(record.content);
  if (JSON.stringify(cleaned) === JSON.stringify(record.content)) {
    console.log("Seed checked. No unchanged legacy placeholders found.");
    break;
  }
  const updated = await rows("mystic_content?id=eq.1&revision=eq." + encodeURIComponent(record.revision), {
    method:"PATCH",
    body:{content:cleaned,revision:randomUUID()},
    prefer:"return=representation",
  });
  if (updated.length) {
    console.log("Removed unchanged legacy placeholders. Other CMS content is preserved.");
    break;
  }
  if (attempt === 2) throw new Error("CMS content changed during cleanup. Rerun the seed command.");
}
