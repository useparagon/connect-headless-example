import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Operator,
  SidebarInputType,
  type EnumInputValue,
  type IntentInputKeyConfig,
} from '@useparagon/connect';

import {
  type FieldOptionsData,
  flattenFieldOptions,
} from '@/lib/field-options';
import { useFieldOptions } from '@/lib/hooks';
import { OPERATOR_LABELS } from './filter-records-operators';
import { useTriggerFormContext } from './trigger-form-context';

export type ConditionalConfig = Extract<
  IntentInputKeyConfig,
  { type: `${SidebarInputType.Conditional}` }
>;

export type FilterCondition = {
  id: string;
  field: string;
  operator: string;
  value: string;
};

export type ConditionGroup = {
  id: string;
  conjunction: 'AND' | 'OR';
  conditions: FilterCondition[];
};

export type FilterValue = ConditionGroup[];

export type UseFilterRecordsStateArgs = {
  config: ConditionalConfig;
  integration: string;
  value: FilterValue;
  onChange: (next: FilterValue) => void;
};

export type FilterRecordsState = {
  groups: FilterValue;
  fieldOptions: EnumInputValue[];
  fieldOptionsRaw: FieldOptionsData;
  operatorItems: Array<{ id: string; name: string }>;
  showFieldCombo: boolean;
  fieldDisabled: boolean;
  fieldPlaceholder: string;
  isLoadingFields: boolean;
  disableOrCondition: boolean;
  addFirstGroup: () => void;
  addAndCondition: (groupIndex: number) => void;
  addOrGroup: () => void;
  patchCondition: (
    groupIndex: number,
    conditionIndex: number,
    patch: Partial<FilterCondition>,
  ) => void;
  removeCondition: (groupIndex: number, conditionIndex: number) => void;
};

function createId(): string {
  return crypto.randomUUID();
}

function createEmptyCondition(): FilterCondition {
  return { id: createId(), field: '', operator: '', value: '' };
}

function createEmptyGroup(conjunction: 'AND' | 'OR'): ConditionGroup {
  return {
    id: createId(),
    conjunction,
    conditions: [createEmptyCondition()],
  };
}

function getEnumOptionValue(item: EnumInputValue): string {
  if (typeof item === 'object') return String(item.value);
  return String(item);
}

export function useFilterRecordsState({
  config,
  integration,
  value,
  onChange,
}: UseFilterRecordsStateArgs): FilterRecordsState {
  const { parametersByKey } = useTriggerFormContext();

  const supportedOperators = config.supportedOperators ?? [];
  const supportedKeys = config.supportedKeys ?? [];
  const disableOrCondition = config.disableOrCondition ?? false;
  const keysSource = config.supportedKeysSource;
  const keysDeps = useMemo(
    () => keysSource?.dependencies ?? [],
    [keysSource?.dependencies],
  );

  const groups: FilterValue = value ?? [];

  const isDynamic = Boolean(keysSource?.sourceType);
  const dependencyParameters = useMemo(
    () =>
      keysDeps.map((key) => ({
        cacheKey: key,
        value: parametersByKey[key] as string | undefined,
      })),
    [keysDeps, parametersByKey],
  );
  const depsSatisfied = dependencyParameters.every((p) => Boolean(p.value));
  const enabled = isDynamic && (keysDeps.length === 0 || depsSatisfied);

  const { data: dynamicData, isFetching: isLoadingFields } = useFieldOptions({
    integration,
    sourceType: keysSource?.sourceType,
    parameters: dependencyParameters,
    enabled,
  });

  const staticFieldOptions: EnumInputValue[] = useMemo(
    () => supportedKeys.map((k) => ({ value: k, label: k })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supportedKeys.join(',')],
  );

  const fieldOptionsRaw: FieldOptionsData = useMemo(() => {
    if (isDynamic) return dynamicData.data;
    return staticFieldOptions;
  }, [isDynamic, dynamicData.data, staticFieldOptions]);

  const fieldOptions: EnumInputValue[] = useMemo(
    () => flattenFieldOptions(fieldOptionsRaw),
    [fieldOptionsRaw],
  );

  const showFieldCombo = isDynamic || staticFieldOptions.length > 0;

  const updateGroups = useCallback(
    (newGroups: FilterValue) => {
      onChange(newGroups);
    },
    [onChange],
  );

  // Reset value when dynamic-source dependencies change. We compare a stable
  // fingerprint string to avoid resetting on the initial mount.
  const depsFingerprint = useMemo(() => {
    if (keysDeps.length === 0) return '';
    return keysDeps
      .map((d) => `${d}:${JSON.stringify(parametersByKey[d] ?? null)}`)
      .join('|');
  }, [keysDeps, parametersByKey]);

  const prevDepsFingerprintRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevDepsFingerprintRef.current === null) {
      prevDepsFingerprintRef.current = depsFingerprint;
      return;
    }
    if (prevDepsFingerprintRef.current === depsFingerprint) return;
    prevDepsFingerprintRef.current = depsFingerprint;
    if (groups.length > 0) {
      updateGroups([]);
    }
  }, [depsFingerprint, groups.length, updateGroups]);

  // When the available field set changes, drop any selected `field` values
  // that are no longer valid options.
  const optionValueSet = useMemo(
    () => new Set(fieldOptions.map(getEnumOptionValue)),
    [fieldOptions],
  );

  useEffect(() => {
    if (!showFieldCombo) return;
    if (isDynamic && isLoadingFields) return;
    if (fieldOptions.length === 0) return;

    let changed = false;
    const next = groups.map((group) => ({
      ...group,
      conditions: group.conditions.map((cond) => {
        if (!cond.field || optionValueSet.has(cond.field)) return cond;
        changed = true;
        return { ...cond, field: '' };
      }),
    }));

    if (changed) updateGroups(next);
  }, [
    showFieldCombo,
    isDynamic,
    isLoadingFields,
    fieldOptions.length,
    optionValueSet,
    groups,
    updateGroups,
  ]);

  const operatorItems = useMemo(
    () =>
      supportedOperators
        .filter((op) => op !== Operator.None)
        .map((op) => ({ id: op, name: OPERATOR_LABELS[op] ?? op })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supportedOperators.join(',')],
  );

  const fieldDisabled = Boolean(keysDeps.length) && !depsSatisfied;
  const fieldPlaceholder = fieldDisabled
    ? 'Select dependencies first'
    : isDynamic && isLoadingFields
      ? 'Loading fields...'
      : 'Select a field';

  const addFirstGroup = useCallback(() => {
    updateGroups([createEmptyGroup('AND')]);
  }, [updateGroups]);

  const addAndCondition = useCallback(
    (groupIndex: number) => {
      const updated = groups.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          conditions: [...group.conditions, createEmptyCondition()],
        };
      });
      updateGroups(updated);
    },
    [groups, updateGroups],
  );

  const addOrGroup = useCallback(() => {
    updateGroups([...groups, createEmptyGroup('OR')]);
  }, [groups, updateGroups]);

  const patchCondition = useCallback(
    (
      groupIndex: number,
      conditionIndex: number,
      patch: Partial<FilterCondition>,
    ) => {
      const updated = groups.map((group, gi) => {
        if (gi !== groupIndex) return group;
        return {
          ...group,
          conditions: group.conditions.map((cond, ci) => {
            if (ci !== conditionIndex) return cond;
            return { ...cond, ...patch };
          }),
        };
      });
      updateGroups(updated);
    },
    [groups, updateGroups],
  );

  const removeCondition = useCallback(
    (groupIndex: number, conditionIndex: number) => {
      let updated = groups.map((group, gi) => {
        if (gi !== groupIndex) return group;
        return {
          ...group,
          conditions: group.conditions.filter(
            (_, ci) => ci !== conditionIndex,
          ),
        };
      });
      updated = updated.filter((group) => group.conditions.length > 0);
      updateGroups(updated);
    },
    [groups, updateGroups],
  );

  return {
    groups,
    fieldOptions,
    fieldOptionsRaw,
    operatorItems,
    showFieldCombo,
    fieldDisabled,
    fieldPlaceholder,
    isLoadingFields: enabled && isLoadingFields,
    disableOrCondition,
    addFirstGroup,
    addAndCondition,
    addOrGroup,
    patchCondition,
    removeCondition,
  };
}
