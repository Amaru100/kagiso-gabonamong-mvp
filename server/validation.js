import { sanitizeRichText } from "../src/richText.js";
import { removeLegacyPlaceholders } from "./legacy-placeholders.js";
export const collections = [
  "articles",
  "events",
  "products",
  "resources",
  "books",
  "testimonials",
];
export function publicContent(content) {
  content = removeLegacyPlaceholders(content);
  return {
    ...content,
    ...Object.fromEntries(
      collections.map((key) => [
        key,
        (content[key] || []).filter((item) => item.published !== false && (key !== "books" || !item.sample)),
      ]),
    ),
  };
}
const fields = {
  testimonials: ["id","title","description","quote","image","published"],
  books: [
    "id",
    "title",
    "author",
    "kind",
    "cover",
    "description",
    "url",
    "coverAlt",
    "coverBackup",
    "featured",
    "sample",
    "published",
  ],
  articles: [
    "id",
    "title",
    "category",
    "readingTime",
    "author",
    "date",
    "excerpt",
    "image",
    "body",
    "bodyHtml",
    "seoTitle",
    "seoDescription",
    "published",
  ],
  events: [
    "id",
    "title",
    "kind",
    "type",
    "date",
    "location",
    "url",
    "description",
    "price",
    "published",
  ],
  products: [
    "id",
    "title",
    "category",
    "type",
    "description",
    "price",
    "published",
  ],
  resources: [
    "id",
    "title",
    "format",
    "author",
    "pages",
    "featured",
    "cover",
    "description",
    "url",
    "price",
    "published",
  ],
};
const settingFields = [
  "authorName",
  "authorBio",
  "authorBioHtml",
  "missionHtml",
  "authorPhoto",
  "heroTitle",
  "heroDescription",
  "email",
  "phone",
  "location",
  "siteName",
  "seoDescription",
  "heroThought",
  "mission",
  "instagram",
  "x",
  "newsletterUrl",
  "recommendationsDescription",
];
export function safeUrl(value) {
  return (
    !value ||
    /^https:\/\/[^\s]+$/i.test(value) ||
    /^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(value)
  );
}
export function validateContent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid content.");
  const result = {};
  for (const key of collections) {
    if (["books","testimonials"].includes(key) && value[key] === undefined)
      value = { ...value, [key]: [] };
    if (!Array.isArray(value[key]) || value[key].length > 500)
      throw new Error(`Invalid ${key} collection.`);
    const ids = new Set();
    result[key] = value[key].map((item) => {
      if (!item || typeof item !== "object")
        throw new Error(`Invalid ${key} entry.`);
      if (
        typeof item.id !== "string" ||
        !/^[a-z0-9-]{1,120}$/.test(item.id) ||
        ids.has(item.id)
      )
        throw new Error(
          "Use unique lowercase IDs with letters, numbers, and hyphens.",
        );
      ids.add(item.id);
      if (typeof item.title !== "string" || !item.title.trim())
        throw new Error("Every entry needs a title.");
      const clean = {};
      for (const field of fields[key]) {
        const entry = item[field];
        if (field === "sample" || field === "featured") {
          if (entry !== undefined && typeof entry !== "boolean")
            throw new Error("Invalid publication flag.");
          clean[field] = entry === true;
          continue;
        }
        if (key === "books" && field === "kind") {
          if (entry && !["recommended", "own"].includes(entry))
            throw new Error("Choose recommended or own for the book type.");
          clean[field] = entry || "recommended";
          continue;
        }
        if (field === "published") {
          clean[field] = entry !== false;
          continue;
        }
        if (field === "price") {
          clean[field] = Number(entry || 0);
          if (!Number.isFinite(clean[field]) || clean[field] < 0)
            throw new Error("Invalid price.");
          continue;
        }
        if (entry !== undefined && typeof entry !== "string")
          throw new Error(`Invalid ${field}.`);
        clean[field] = entry || "";
        if (clean[field].length > (["body","bodyHtml"].includes(field) ? 150000 : 5000))
          throw new Error(`${field} is too long.`);
        if (["url", "image", "cover", "coverBackup"].includes(field) && !safeUrl(clean[field]))
          throw new Error("Use an HTTPS URL or a local asset path.");
      }
      if (clean.bodyHtml) clean.bodyHtml = sanitizeRichText(clean.bodyHtml);
      return clean;
    });
  }
  if (!value.settings || typeof value.settings !== "object")
    throw new Error("Missing site settings.");
  result.settings = {};
  for (const field of settingFields) {
    const optional = ["authorBioHtml","missionHtml","siteName","seoDescription","heroThought","mission","instagram","x","newsletterUrl", "recommendationsDescription"].includes(field);
    if (optional && value.settings[field] === undefined) {
      if (!field.endsWith("Html")) result.settings[field] = "";
      continue;
    }
    if (
      typeof value.settings[field] !== "string" ||
      value.settings[field].length > 15000
    )
      throw new Error(`Invalid ${field}.`);
    result.settings[field] = field.endsWith("Html") ? sanitizeRichText(value.settings[field]) : value.settings[field];
  }
  if (!result.settings.authorName.trim() || !result.settings.heroTitle.trim())
    throw new Error("Author name and homepage heading are required.");
  if (!safeUrl(result.settings.authorPhoto) || !safeUrl(result.settings.newsletterUrl) || !safeUrl(result.settings.instagram) || !safeUrl(result.settings.x))
    throw new Error("Use an HTTPS photo URL or a local asset path.");
  if (
    (result.settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.settings.email)) ||
    /[\r\n]/.test(result.settings.phone)
  )
    throw new Error("Enter valid contact details.");
  return removeLegacyPlaceholders(result);
}
