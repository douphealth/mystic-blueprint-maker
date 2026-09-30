import { useEffect } from "react";

/**
 * Mark the current route as not-for-search while it is mounted.
 *
 * The app is a single-page site, so every route is served the same index.html.
 * Checkout-return and 404 routes must not be indexed; a robots meta added on
 * mount is read by Google and Bing, which both render JavaScript.
 */
export function useNoindex(): void {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-managed", "use-noindex");
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);
}
