import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export function usePersistedState<T>(storageKey: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const storedValue = await SecureStore.getItemAsync(storageKey);

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
        await SecureStore.setItemAsync(storageKey, JSON.stringify(value));
      } catch {
        // Ignore persistence errors for non-critical UI state.
      }
    };

    void persist();
  }, [isHydrated, storageKey, value]);

  return [value, setValue, isHydrated] as const;
}
