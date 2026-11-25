import { readFile } from "node:fs/promises";
import { rows } from "../server/database.js";
import { validateContent } from "../server/validation.js";

const content = validateContent(JSON.parse(await readFile(new URL("../src/data/content.json",import.meta.url),"utf8")));
await rows("mystic_content?on_conflict=id", {
  method:"POST", body:{id:1,content}, prefer:"resolution=ignore-duplicates,return=minimal",
});
console.log("Seed checked. Existing CMS content is preserved.");
