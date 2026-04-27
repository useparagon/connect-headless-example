import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ParametersByKey = Record<string, unknown>;

type TriggerFormContextValue = {
  /**
   * Values of sibling trigger inputs, indexed by their `IntentInputKeyConfig.id`.
   * This is the key space that `DynamicDataSource.refreshDependencies` entries
   * reference.
   */
  parametersByKey: ParametersByKey;
  registerParameter: (key: string, value: unknown) => void;
  unregisterParameter: (key: string) => void;
};

const TriggerFormContext = createContext<TriggerFormContextValue | null>(null);

export function TriggerFormProvider({ children }: { children: ReactNode }) {
  const [parametersByKey, setParametersByKey] = useState<ParametersByKey>({});

  const registerParameter = useCallback((key: string, value: unknown) => {
    setParametersByKey((prev) => {
      if (key in prev && Object.is(prev[key], value)) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const unregisterParameter = useCallback((key: string) => {
    setParametersByKey((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = useMemo<TriggerFormContextValue>(
    () => ({ parametersByKey, registerParameter, unregisterParameter }),
    [parametersByKey, registerParameter, unregisterParameter],
  );

  console.log('trigger form context', parametersByKey);

  return (
    <TriggerFormContext.Provider value={value}>
      {children}
    </TriggerFormContext.Provider>
  );
}

export function useTriggerFormContext() {
  const ctx = useContext(TriggerFormContext);
  if (!ctx) {
    throw new Error(
      'useTriggerFormContext must be used inside <TriggerFormProvider>',
    );
  }
  return ctx;
}
