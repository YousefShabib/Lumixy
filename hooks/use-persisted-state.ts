import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/** Persists non-sensitive UI state (filters, draft queries). Tokens stay in Secure Store via `storage.ts`. */
export function usePersistedState<T>(storageKey: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(storageKey);

        if (storedValue == null || !isMounted) {
          return;
        }

        setValue(JSON.parse(storedValue) as T);
      } catch {
        // Ignore storage hydration errors for non-critical UI state.
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Ignore persistence errors for non-critical UI state.
      }
    };

    void persist();
  }, [isHydrated, storageKey, value]);

  return [value, setValue, isHydrated] as const;
}
