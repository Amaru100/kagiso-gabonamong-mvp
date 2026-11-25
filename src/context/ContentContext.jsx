import { createContext, useContext, useEffect, useState } from "react";
import initialContent from "virtual:public-content";
const ContentContext = createContext(null);
export function ContentProvider({ children }) {
  const [content, setContent] = useState(initialContent);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then(async (response) => {
        if (!response.headers.get("content-type")?.includes("application/json")) return;
        if (!response.ok) throw new Error("Published content is temporarily unavailable.");
        const result = await response.json();
        if (result.content?.settings) setContent(result.content);
      })
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return (
    <ContentContext.Provider value={{ content, setContent, loading, error }}>
      {children}
    </ContentContext.Provider>
  );
}
export const useContent = () => useContext(ContentContext);
export const published = (items) =>
  items.filter((item) => item.published !== false);
