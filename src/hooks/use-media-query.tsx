import { useState, useEffect } from "react";

type MediaQueryOptions = {
  defaultValue?: boolean;
};

export function useMediaQuery(query: string, options: MediaQueryOptions = {}) {
  const { defaultValue = false } = options;

  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Set initial value
      setMatches(media.matches);

      // Define listener
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add listener
      media.addEventListener("change", listener);

      // Clean up
      return () => {
        media.removeEventListener("change", listener);
      };
    }
  }, [query]);

  return matches;
}

// Predefined breakpoints
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsLargeDesktop() {
  return useMediaQuery("(min-width: 1280px)");
}
