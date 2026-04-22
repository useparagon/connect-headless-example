import { useMemo, useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import type { EnumInputValue } from '@useparagon/connect';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComboboxField } from '@/components/form/combobox-field';
import { ComboboxOptions } from '@/components/form/combobox-options';
import { FieldLabel } from '@/components/form/field-label';
import {
  type FieldOptionsData,
  flattenFieldOptions,
} from '@/lib/field-options';

import { operatorHasArgument } from './filter-records-operators';
import {
  type ConditionalConfig,
  type FilterCondition,
  type FilterRecordsState,
  type FilterValue,
  useFilterRecordsState,
} from './use-filter-records-state';

// Radix `Select` warns when its `value` flips between `undefined` and a
// defined string (controlled <-> uncontrolled). It also rejects `''` as a
// valid item value, so we use this sentinel to keep the select controlled
// while still rendering the placeholder when no operator is selected.
const OPERATOR_PLACEHOLDER = '__operator_placeholder__';

type Props = {
  config: ConditionalConfig;
  integration: string;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

type FieldRenderConfig = {
  options: FieldOptionsData;
  disabled: boolean;
  placeholder: string;
  showCombo: boolean;
  isLoading: boolean;
};

export function FilterRecordsInput({
  config,
  integration,
  value,
  onChange,
}: Props) {
  const state = useFilterRecordsState({ config, integration, value, onChange });

  if (state.groups.length === 0) {
    return (
      <EmptyState
        id={config.id}
        title={config.title}
        required={config.required ?? false}
        onAddFirstGroup={state.addFirstGroup}
      />
    );
  }

  const fieldRenderConfig: FieldRenderConfig = {
    options: state.fieldOptionsRaw,
    disabled: state.fieldDisabled,
    placeholder: state.fieldPlaceholder,
    showCombo: state.showFieldCombo,
    isLoading: state.isLoadingFields,
  };

  return (
    <div className="flex flex-col gap-3">
      <FilterFieldLabel
        id={config.id}
        title={config.title}
        required={config.required ?? false}
      />
      {state.groups.map((group, groupIndex) => (
        <GroupSection
          key={group.id}
          group={group}
          groupIndex={groupIndex}
          isLast={groupIndex === state.groups.length - 1}
          disableOrCondition={state.disableOrCondition}
          fieldRenderConfig={fieldRenderConfig}
          operatorItems={state.operatorItems}
          onPatchCondition={state.patchCondition}
          onRemoveCondition={state.removeCondition}
          onAddAndCondition={state.addAndCondition}
          onAddOrGroup={state.addOrGroup}
        />
      ))}
    </div>
  );
}

// -- Subcomponents -----------------------------------------------------------

function FilterFieldLabel({
  id,
  title,
  required,
}: {
  id: string;
  title: string;
  required: boolean;
}) {
  return (
    <FieldLabel id={id} required={required}>
      {title}
      {!required && (
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </FieldLabel>
  );
}

function EmptyState({
  id,
  title,
  required,
  onAddFirstGroup,
}: {
  id: string;
  title: string;
  required: boolean;
  onAddFirstGroup: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FilterFieldLabel id={id} title={title} required={required} />
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
          onClick={onAddFirstGroup}
        >
          <PlusIcon />
          Add filter
        </Button>
      </div>
    </div>
  );
}

type GroupSectionProps = {
  group: { id: string; conditions: FilterCondition[] };
  groupIndex: number;
  isLast: boolean;
  disableOrCondition: boolean;
  fieldRenderConfig: FieldRenderConfig;
  operatorItems: FilterRecordsState['operatorItems'];
  onPatchCondition: FilterRecordsState['patchCondition'];
  onRemoveCondition: FilterRecordsState['removeCondition'];
  onAddAndCondition: FilterRecordsState['addAndCondition'];
  onAddOrGroup: FilterRecordsState['addOrGroup'];
};

function GroupSection({
  group,
  groupIndex,
  isLast,
  disableOrCondition,
  fieldRenderConfig,
  operatorItems,
  onPatchCondition,
  onRemoveCondition,
  onAddAndCondition,
  onAddOrGroup,
}: GroupSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      {groupIndex > 0 && <ConjunctionLabel>Or</ConjunctionLabel>}
      {group.conditions.map((condition, condIndex) => (
        <div key={condition.id} className="flex flex-col gap-1">
          {condIndex > 0 && <ConjunctionLabel>And</ConjunctionLabel>}
          <ConditionRow
            condition={condition}
            field={fieldRenderConfig}
            operatorItems={operatorItems}
            onPatch={(patch) => onPatchCondition(groupIndex, condIndex, patch)}
            onRemove={() => onRemoveCondition(groupIndex, condIndex)}
          />
        </div>
      ))}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => onAddAndCondition(groupIndex)}
        >
          <PlusIcon />
          And
        </Button>
        {!disableOrCondition && isLast && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onAddOrGroup}
          >
            <PlusIcon />
            Or
          </Button>
        )}
      </div>
    </div>
  );
}

function ConjunctionLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

type ConditionRowProps = {
  condition: FilterCondition;
  field: FieldRenderConfig;
  operatorItems: FilterRecordsState['operatorItems'];
  onPatch: (patch: Partial<FilterCondition>) => void;
  onRemove: () => void;
};

function ConditionRow({
  condition,
  field,
  operatorItems,
  onPatch,
  onRemove,
}: ConditionRowProps) {
  const handleOperatorChange = (next: string) => {
    const patch: Partial<FilterCondition> = { operator: next };
    if (!operatorHasArgument(next)) {
      patch.value = '';
    }
    onPatch(patch);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        {field.showCombo ? (
          <FieldComboBox
            value={condition.field}
            options={field.options}
            placeholder={field.placeholder}
            disabled={field.disabled}
            isFetching={field.isLoading}
            onSelect={(next) => onPatch({ field: next ?? '' })}
          />
        ) : (
          <Input
            value={condition.field}
            onChange={(e) => onPatch({ field: e.target.value })}
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Select
          value={condition.operator || OPERATOR_PLACEHOLDER}
          onValueChange={(next) =>
            handleOperatorChange(next === OPERATOR_PLACEHOLDER ? '' : next)
          }
        >
          <SelectTrigger
            aria-label="Operator"
            className="w-full"
            disabled={operatorItems.length === 0}
          >
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {operatorItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {operatorHasArgument(condition.operator) && (
        <div className="flex-1 min-w-0">
          <Input
            value={condition.value}
            onChange={(e) => onPatch({ value: e.target.value })}
            placeholder="Value"
          />
        </div>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label="Remove condition"
        className="text-muted-foreground hover:text-destructive"
      >
        <XIcon />
      </Button>
    </div>
  );
}

// -- Field combobox ----------------------------------------------------------

function getEnumOptionLabel(item: EnumInputValue): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  return item.label ?? String(item.value);
}

function getEnumOptionValue(item: EnumInputValue): string {
  if (typeof item === 'object') return String(item.value);
  return String(item);
}

function FieldComboBox({
  value,
  options,
  placeholder,
  disabled,
  isFetching,
  onSelect,
}: {
  value: string;
  options: FieldOptionsData;
  placeholder: string;
  disabled: boolean;
  isFetching: boolean;
  onSelect: (next: string | null) => void;
}) {
  const [search, setSearch] = useState('');

  const flatOptions = useMemo(() => flattenFieldOptions(options), [options]);

  // Client-side filtering. Dynamic-source results are typically small enough
  // for this to be fine, and it matches the source component's behavior. When
  // the user is actively searching we collapse sections into a flat result
  // list; otherwise we preserve the grouped structure.
  const renderData: FieldOptionsData = useMemo(() => {
    if (!search) return options;
    const needle = search.toLowerCase();
    return flatOptions.filter((opt) =>
      getEnumOptionLabel(opt).toLowerCase().includes(needle),
    );
  }, [options, flatOptions, search]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const match = flatOptions.find((opt) => getEnumOptionValue(opt) === value);
    return match ? getEnumOptionLabel(match) : value;
  }, [flatOptions, value]);

  return (
    <ComboboxField
      id="filter-field"
      required={false}
      value={value || null}
      placeholder={selectedLabel ?? placeholder}
      onSelect={onSelect}
      onDebouncedChange={setSearch}
      isFetching={isFetching}
      disabled={disabled}
      allowClear
    >
      <ComboboxOptions data={renderData} />
    </ComboboxField>
  );
}
