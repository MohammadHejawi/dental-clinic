import React, { createContext, useContext, useEffect, useState } from "react";

type ContentMap = Record<string, string>;

interface SiteContentCtx {
  content: ContentMap;
  get: (key: string, fallback: string) => string;
  refresh: () => void;
}

const SiteContentContext = createContext<SiteContentCtx>({
  content: {},
  get: (_key, fallback) => fallback,
  refresh: () => {},
});

export const useSiteContent = () => useContext(SiteContentContext);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentMap>({});

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setContent(data.content);
      }
    } catch {
      // API unavailable — use defaults silently
    }
  };

  useEffect(() => {
    fetchContent();
    // Re-fetch when the tab becomes visible again (e.g. user switches from admin tab)
    const onVisibility = () => { if (document.visibilityState === "visible") fetchContent(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const get = (key: string, fallback: string) => content[key] ?? fallback;

  return (
    <SiteContentContext.Provider value={{ content, get, refresh: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}
