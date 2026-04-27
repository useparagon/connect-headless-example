import { useEffect, useMemo, useState } from 'react';
import {
  SidebarInputType,
  DataSourceType,
  type ConnectInputValue,
  type IntentInputKeyConfig,
  type GraphiteEnumInput,
  type SerializedConnectInput,
  type DynamicDataSource,
  type StaticEnumDataSource,
  type SingleSource,
  type EnumInputValue,
} from '@useparagon/connect';

import { SerializedConnectInputPicker } from '../serialized-connect-input-picker';
import { TextInputField } from '../../form/text-input-field';
import { SelectField } from '../../form/select-field';
import { FieldLabel } from '../../form/field-label';
import { Textarea } from '../../ui/textarea';
import { cn } from '@/lib/utils';
import { ComboboxField } from '@/components/form/combobox-field';
import { ComboboxOptions } from '@/components/form/combobox-options';
import { findFieldOption } from '@/lib/field-options';
import { useFieldOptions, useSourcesForTriggerInput } from '@/lib/hooks';
import { useTriggerFormContext } from './trigger-form-context';
import { FilterRecordsInput } from './filter-records-input';
import type {
  ConditionalConfig,
  FilterValue,
} from './use-filter-records-state';

type Props = {
  integration: string;
  config: IntentInputKeyConfig;
  value: unknown;
  onChange: (value: unknown) => void;
};

const PROXY_TYPES = new Set<string>([
  SidebarInputType.Switch,
  SidebarInputType.BooleanInput,
  SidebarInputType.ValueText,
  SidebarInputType.Password,
  SidebarInputType.Number,
]);

function toSerializedConnectInput(
  config: IntentInputKeyConfig,
): SerializedConnectInput {
  return {
    id: config.id,
    title: config.title,
    type: config.type,
    required: config.required,
    tooltip: config.subtitle,
  } as SerializedConnectInput;
}

function getEnumLabel(item: GraphiteEnumInput): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return String(item);
  return item.label ?? String(item.value);
}

function getEnumValue(item: GraphiteEnumInput): string {
  if (typeof item === 'object') return String(item.value);
  return String(item);
}

export function TriggerParameterInput({
  integration,
  config,
  value,
  onChange,
}: Props) {
  const required = config.required ?? false;

  if (PROXY_TYPES.has(config.type)) {
    return (
      <SerializedConnectInputPicker
        integration={integration}
        field={toSerializedConnectInput(config)}
        value={value as ConnectInputValue}
        onChange={onChange}
      />
    );
  }

  if (
    config.type === SidebarInputType.Enum ||
    config.type === SidebarInputType.EditableEnum ||
    config.type === SidebarInputType.EnumTextAreaPairInput
  ) {
    const values = 'values' in config ? config.values : [];
    return (
      <SelectField
        id={config.id}
        title={config.title}
        required={required}
        value={(value as string) ?? null}
        onChange={(v) => onChange(v ?? undefined)}
      >
        {values.map((item) => (
          <SelectField.Item key={getEnumValue(item)} value={getEnumValue(item)}>
            {getEnumLabel(item)}
          </SelectField.Item>
        ))}
      </SelectField>
    );
  }

  if (
    config.type === SidebarInputType.Text ||
    config.type === SidebarInputType.Code
  ) {
    return (
      <TextInputField
        type="text"
        id={config.id}
        title={config.title}
        subtitle={config.subtitle}
        required={required}
        value={String(value ?? '')}
        onChange={onChange}
        className={cn(config.type === SidebarInputType.Code && 'font-mono')}
        placeholder={config.placeholder}
      />
    );
  }

  if (config.type === SidebarInputType.TextArea) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <FieldLabel id={config.id} required={required}>
          {config.title}
        </FieldLabel>
        {config.subtitle && (
          <p className="text-sm text-gray-500">{config.subtitle}</p>
        )}
        <Textarea
          id={config.id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
        />
      </div>
    );
  }

  return (
    <div>
      <p>Field not supported:</p>
      <pre className="max-w-full max-h-[150px] text-sm overflow-auto bg-card p-2 rounded-md border border-border">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  );
}

type FieldProps = {
  integration: string;
  param: IntentInputKeyConfig;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function TriggerParameterField(props: FieldProps) {
  if (props.param.type === SidebarInputType.Conditional) {
    return (
      <FilterRecordsInput
        config={props.param as ConditionalConfig}
        integration={props.integration}
        value={(props.value as FilterValue | undefined) ?? []}
        onChange={(next) => props.onChange(next)}
      />
    );
  }

  return <SourcedTriggerParameterField {...props} />;
}

function SourcedTriggerParameterField(props: FieldProps) {
  const triggerInputSource = useSourcesForTriggerInput(props.param);
  const { registerParameter, unregisterParameter } = useTriggerFormContext();
  const dependencyKey = props.param.id;

  useEffect(() => {
    registerParameter(dependencyKey, props.value);
    return () => unregisterParameter(dependencyKey);
  }, [dependencyKey, props.value, registerParameter, unregisterParameter]);

  if (!triggerInputSource || triggerInputSource.kind !== 'single') {
    return (
      <TriggerParameterInput
        integration={props.integration}
        config={props.param}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  const { source } = triggerInputSource as SingleSource;

  if (source.type === DataSourceType.STATIC_ENUM) {
    return (
      <StaticEnumTriggerParameterField
        param={props.param}
        source={source as StaticEnumDataSource}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  if (source.type === DataSourceType.DYNAMIC) {
    return (
      <DynamicTriggerParameterField
        integration={props.integration}
        param={props.param}
        source={source as DynamicDataSource<unknown>}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  return null;
}

function StaticEnumTriggerParameterField({
  param,
  source,
  value,
  onChange,
}: {
  param: IntentInputKeyConfig;
  source: StaticEnumDataSource;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const flatOptions = useMemo<EnumInputValue[]>(() => {
    if (!Array.isArray(source.values)) return [];
    return source.values.flatMap((item) =>
      item && typeof item === 'object' && 'items' in item ? item.items : [item],
    );
  }, [source.values]);

  return (
    <SelectField
      id={param.id}
      title={param.title}
      required={param.required ?? false}
      value={(value as string) ?? null}
      onChange={(v) => onChange(v ?? undefined)}
      allowClear
    >
      {flatOptions.map((option) => (
        <SelectField.Item
          key={String(option.value)}
          value={String(option.value)}
        >
          {option.label}
        </SelectField.Item>
      ))}
    </SelectField>
  );
}

function DynamicTriggerParameterField({
  integration,
  param,
  source,
  value,
  onChange,
}: {
  integration: string;
  param: IntentInputKeyConfig;
  source: DynamicDataSource<unknown>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { parametersByKey } = useTriggerFormContext();
  const [search, setSearch] = useState('');

  const stringDependencyKeys = useMemo(
    () =>
      (source.refreshDependencies ?? []).filter(
        (dep): dep is string => typeof dep === 'string',
      ),
    [source.refreshDependencies],
  );

  const dependencyParameters = useMemo(
    () =>
      stringDependencyKeys.map((key) => ({
        cacheKey: key,
        value: parametersByKey[key] as string | undefined,
      })),
    [stringDependencyKeys, parametersByKey],
  );

  // `refreshDependencies === undefined` means "only refresh on manual invoke"
  // per the SDK. We treat that as "never auto-fetch" for now.
  const noDependencies =
    source.refreshDependencies === undefined ||
    source.refreshDependencies.length === 0;
  const allDependenciesSatisfied = dependencyParameters.every((p) =>
    Boolean(p.value),
  );
  const enabled = noDependencies || allDependenciesSatisfied;

  const { data, isFetching } = useFieldOptions({
    integration,
    source,
    parameters: dependencyParameters,
    search,
    enabled,
  });

  const selectedOption = useMemo(
    () => findFieldOption(data.data, value),
    [data.data, value],
  );

  return (
    <ComboboxField
      id={param.id}
      title={param.title}
      required={param.required ?? false}
      value={(value as string) ?? null}
      placeholder={selectedOption?.label ?? 'Select an option...'}
      onSelect={(next) => onChange(next ?? undefined)}
      onDebouncedChange={setSearch}
      isFetching={isFetching}
      disabled={!enabled}
      allowClear
    >
      <ComboboxOptions data={data.data} />
    </ComboboxField>
  );
}
