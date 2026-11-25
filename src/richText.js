const tags = new Set(["p", "h2", "h3", "h4", "h5", "blockquote", "ul", "ol", "li", "em", "strong", "b", "i", "hr", "br", "a"]);

export function sanitizeRichText(value) {
  return value.replace(/<[^>]*>|</g, (token) => {
    const match = /^<(\/?)([a-z0-9]+)([\s\S]*)>$/i.exec(token);
    if (!match) return token === "<" ? "&lt;" : "";
    const [, end, rawTag, attrs] = match;
    const tag = rawTag.toLowerCase();
    if (!tags.has(tag)) return "";
    if (tag === "a" && !end) {
      const url = /\bhref="(https:\/\/[^"<>\s]+)"/i.exec(attrs)?.[1];
      return url ? '<a href="' + url.replace(/&(?!(?:amp;))/g, "&amp;") + '" rel="noreferrer">' : "<a>";
    }
    return "<" + end + tag + ">";
  });
}
