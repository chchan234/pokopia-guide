'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { collectionStorageKey, defaultCollectionState, type CollectionState } from '@/lib/collection';

interface CollectionContextValue {
  hydrated: boolean;
  state: CollectionState;
  pokemonOwnedSet: Set<string>;
  habitatOwnedSet: Set<string>;
  recordOwnedSet: Set<number>;
  fashionOwnedSet: Set<string>;
  bestshotOwnedSet: Set<string>;
  togglePokemon: (slug: string) => void;
  toggleHabitat: (id: string) => void;
  toggleRecord: (id: number) => void;
  toggleFashion: (id: string) => void;
  toggleBestshot: (id: string) => void;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

const storeListeners = new Set<() => void>();
let cachedClientRaw: string | null = null;
let cachedClientSnapshot: CollectionState = defaultCollectionState;
let memoryFallbackRaw: string | null = null;

function toggleStringValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function toggleNumberValue(list: number[], value: number) {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function parseStoredState(raw: string | null): CollectionState {
  if (!raw) {
    return defaultCollectionState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CollectionState>;

    return {
      pokemon: Array.isArray(parsed.pokemon) ? parsed.pokemon.filter((entry): entry is string => typeof entry === 'string') : [],
      habitats: Array.isArray(parsed.habitats)
        ? parsed.habitats.filter((entry): entry is string => typeof entry === 'string')
        : [],
      records: Array.isArray(parsed.records) ? parsed.records.filter((entry): entry is number => typeof entry === 'number') : [],
      fashion: Array.isArray(parsed.fashion) ? parsed.fashion.filter((entry): entry is string => typeof entry === 'string') : [],
      bestshots: Array.isArray(parsed.bestshots) ? parsed.bestshots.filter((entry): entry is string => typeof entry === 'string') : [],
    };
  } catch {
    return defaultCollectionState;
  }
}

function getServerSnapshot() {
  return defaultCollectionState;
}

function getClientSnapshot() {
  if (typeof window === 'undefined') {
    return defaultCollectionState;
  }

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(collectionStorageKey);
    memoryFallbackRaw = raw;
  } catch {
    raw = memoryFallbackRaw;
  }

  if (raw === cachedClientRaw) {
    return cachedClientSnapshot;
  }

  cachedClientRaw = raw;
  cachedClientSnapshot = parseStoredState(raw);

  return cachedClientSnapshot;
}

function subscribe(callback: () => void) {
  storeListeners.add(callback);

  if (typeof window === 'undefined') {
    return () => storeListeners.delete(callback);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === collectionStorageKey) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    storeListeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function emitStoreChange() {
  for (const listener of storeListeners) {
    listener();
  }
}

function updateStoredState(updater: (current: CollectionState) => CollectionState) {
  const nextState = updater(getClientSnapshot());
  const nextRaw = JSON.stringify(nextState);
  cachedClientRaw = nextRaw;
  cachedClientSnapshot = nextState;
  memoryFallbackRaw = nextRaw;

  try {
    window.localStorage.setItem(collectionStorageKey, nextRaw);
  } catch {
    // localStorage unavailable (private mode/restricted policy), keep in-memory fallback.
  }

  emitStoreChange();
}

export function CollectionProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const togglePokemon = useCallback((slug: string) => {
    updateStoredState((current) => ({
      ...current,
      pokemon: toggleStringValue(current.pokemon, slug),
    }));
  }, []);

  const toggleHabitat = useCallback((id: string) => {
    updateStoredState((current) => ({
      ...current,
      habitats: toggleStringValue(current.habitats, id),
    }));
  }, []);

  const toggleRecord = useCallback((id: number) => {
    updateStoredState((current) => ({
      ...current,
      records: toggleNumberValue(current.records, id),
    }));
  }, []);

  const toggleFashion = useCallback((id: string) => {
    updateStoredState((current) => ({
      ...current,
      fashion: toggleStringValue(current.fashion, id),
    }));
  }, []);

  const toggleBestshot = useCallback((id: string) => {
    updateStoredState((current) => ({
      ...current,
      bestshots: toggleStringValue(current.bestshots, id),
    }));
  }, []);

  const value = useMemo<CollectionContextValue>(
    () => ({
      hydrated,
      state,
      pokemonOwnedSet: new Set(state.pokemon),
      habitatOwnedSet: new Set(state.habitats),
      recordOwnedSet: new Set(state.records),
      fashionOwnedSet: new Set(state.fashion),
      bestshotOwnedSet: new Set(state.bestshots),
      togglePokemon,
      toggleHabitat,
      toggleRecord,
      toggleFashion,
      toggleBestshot,
    }),
    [hydrated, state, toggleBestshot, toggleFashion, toggleHabitat, togglePokemon, toggleRecord]
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error('useCollection must be used within CollectionProvider');
  }

  return context;
}
