/*
 * useContentMemo
 * --------------------------------------
 * Utility hook for content based memoization
 */
import * as React from 'react';

/**
 * Returns a reference to the passed in item which only updates when the *content* of the item updates rather than just the pointer reference
 * WARNING: This hook was designed for config/state objects and assumes that array/object items are serializable
 * @param item The item to pass a reference for
 * @returns A memoized version of the item passed in
 */
export const useContentMemo = <T>(item: T): T => {
  const contentDependency = React.useMemo(() => {
    // falsy item or function, all we can do is return the reference like a normal memo
    if (!item || typeof item === 'function') {
      return item;
    }
    // sort array and serialize it for primitive comparison
    if (Array.isArray(item)) {
      return JSON.stringify([...item].sort());
    }
    // sort object keys and serialize it for primitive comparison
    if (typeof item === 'object') {
      return JSON.stringify(
        Object.keys(item)
          .sort()
          .reduce((memo, key) => ({ ...memo, [key]: item[key as keyof typeof item] }), {})
      );
    }
    // stringify primitive for comparison
    return `${item as string}`;
  }, [item]);

  return React.useMemo(() => item, [contentDependency]);
};
