/**
 * 结果缓存Hook
 * 用于缓存计算结果,提升性能
 */

import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';

interface CacheOptions {
  key: string;
  ttl?: number; // 缓存时间(毫秒),默认30分钟
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 内存缓存
const memoryCache = new Map<string, CacheItem<unknown>>();

export function useCache<T>(options: CacheOptions) {
  const { key, ttl = 30 * 60 * 1000, storage = 'memory' } = options;

  const clearCache = useCallback(() => {
    try {
      if (storage === 'memory') {
        memoryCache.delete(key);
      } else if (storage === 'localStorage') {
        localStorage.removeItem(key);
      } else if (storage === 'sessionStorage') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }, [key, storage]);

  const getCache = useCallback((): T | null => {
    try {
      let cacheItem: CacheItem<T> | null = null;

      if (storage === 'memory') {
        cacheItem = (memoryCache.get(key) as CacheItem<T> | undefined) ?? null;
      } else if (storage === 'localStorage') {
        const stored = localStorage.getItem(key);
        cacheItem = stored ? (JSON.parse(stored) as CacheItem<T>) : null;
      } else if (storage === 'sessionStorage') {
        const stored = sessionStorage.getItem(key);
        cacheItem = stored ? (JSON.parse(stored) as CacheItem<T>) : null;
      }

      if (cacheItem) {
        const now = Date.now();
        if (now - cacheItem.timestamp < cacheItem.ttl) {
          return cacheItem.data;
        } else {
          // 缓存过期,清除
          clearCache();
        }
      }
    } catch (error) {
      console.error('读取缓存失败:', error);
    }

    return null;
  }, [clearCache, key, storage]);

  const setCache = useCallback((data: T) => {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      if (storage === 'memory') {
        memoryCache.set(key, cacheItem);
      } else if (storage === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(cacheItem));
      } else if (storage === 'sessionStorage') {
        sessionStorage.setItem(key, JSON.stringify(cacheItem));
      }
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }, [key, storage, ttl]);

  return { getCache, setCache, clearCache };
}

/**
 * 带缓存的数据获取Hook
 */
export function useCachedData<T>(
  fetchFn: () => T | Promise<T>,
  cacheKey: string,
  options?: Partial<CacheOptions>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { getCache, setCache } = useCache<T>({
    key: cacheKey,
    ...options
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    // 如果不强制刷新,先尝试从缓存读取
    if (!forceRefresh) {
      const cached = getCache();
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Promise.resolve(fetchFn());
      setData(result);
      setCache(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, getCache, setCache]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
  };
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  // 清除内存缓存
  memoryCache.clear();

  // 清除localStorage中的缓存
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清除localStorage缓存失败:', error);
  }

  // 清除sessionStorage中的缓存
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清除sessionStorage缓存失败:', error);
  }
}

/**
 * 虚拟滚动Hook
 * 用于优化大数据量列表渲染
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  // 可见项
  const visibleItems = items.slice(startIndex, endIndex);

  // 偏移量
  const offsetY = startIndex * itemHeight;

  // 总高度
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
    onScroll: (e: UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

/**
 * 防抖Hook
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流Hook
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const elapsed = lastRanRef.current === 0 ? limit : now - lastRanRef.current;
    const delay = Math.max(limit - elapsed, 0);

    const handler = setTimeout(() => {
      lastRanRef.current = Date.now();
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}
