export const collections = ["articles", "events", "products", "resources"];
export function publicContent(content) {
  return {
    ...content,
    ...Object.fromEntries(
      collections.map((key) => [
        key,
        content[key].filter((item) => item.published !== false),
      ]),
    ),
  };
}
const fields = {
  articles: [
    "id",
    "title",
    "category",
    "readingTime",
    "excerpt",
    "image",
    "body",
    "published",
  ],
  events: [
    "id",
    "title",
    "kind",
    "type",
    "date",
    "location",
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
    "description",
    "url",
    "price",
    "published",
  ],
};
const settingFields = [
  "authorName",
  "authorBio",
  "authorPhoto",
  "heroTitle",
  "heroDescription",
  "email",
  "phone",
  "location",
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
        if (clean[field].length > (field === "body" ? 150000 : 5000))
          throw new Error(`${field} is too long.`);
        if (["url", "image"].includes(field) && !safeUrl(clean[field]))
          throw new Error("Use an HTTPS URL or a local asset path.");
      }
      return clean;
    });
  }
  if (!value.settings || typeof value.settings !== "object")
    throw new Error("Missing site settings.");
  result.settings = {};
  for (const field of settingFields) {
    if (
      typeof value.settings[field] !== "string" ||
      value.settings[field].length > 15000
    )
      throw new Error(`Invalid ${field}.`);
    result.settings[field] = value.settings[field];
  }
  if (!result.settings.authorName.trim() || !result.settings.heroTitle.trim())
    throw new Error("Author name and homepage heading are required.");
  if (!safeUrl(result.settings.authorPhoto))
    throw new Error("Use an HTTPS photo URL or a local asset path.");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.settings.email) ||
    /[\r\n]/.test(result.settings.phone)
  )
    throw new Error("Enter valid contact details.");
  return result;
}
