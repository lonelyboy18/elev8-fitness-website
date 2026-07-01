import { useEffect } from "react";

/** Sets document.title per page — replaces the per-HTML-file <title> tags of the legacy multi-page site. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
