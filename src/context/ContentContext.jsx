import { createContext, useContext, useEffect, useState } from "react";
import initialContent from "virtual:public-content";
const ContentContext = createContext(null);
export function ContentProvider({ children }) {
  const [content, setContent] = useState(initialContent);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then(async (response) => {
        if (
          !response.ok ||
          !response.headers.get("content-type")?.includes("application/json")
        )
          return;
        const result = await response.json();
        if (result.content?.settings) setContent(result.content);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <ContentContext.Provider value={{ content, setContent }}>
      {children}
    </ContentContext.Provider>
  );
}
export const useContent = () => useContext(ContentContext);
export const published = (items) =>
  items.filter((item) => item.published !== false);
