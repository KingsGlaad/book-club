// hooks/useInfiniteScroll.ts
import { useCallback, useRef, useEffect } from "react";

export function useInfiniteScroll(
  loading: boolean,
  shouldLoadMore: boolean,
  loadMore: () => void
) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && shouldLoadMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, shouldLoadMore, loadMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}
