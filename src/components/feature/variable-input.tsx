import { useFieldOptions } from '@/lib/hooks';
import { SelectField } from '../form/select-field';
import { MultiSelectField } from '../form/multi-select-field';
import { TextInputField } from '../form/text-input-field';
import { ComboboxField } from '@/components/form/combobox-field';
import { LoaderCircle, MinusCircleIcon } from 'lucide-react';
import { DynamicDefaultInput } from '@useparagon/connect';
import { Button } from '../ui/button';
import { useState } from 'react';

type VariableInputValue = string | string[] | undefined;

type Props = {
  integration: string;
  sourceType: string;
  mainInputKey: string;
  dependantInputKey: string;
  mainInputValue: string;
  dependantInputValue: string;
  variableInputsValues: Record<string, VariableInputValue>;
  onVariableInputsValuesChange: (
    config: Record<string, VariableInputValue>
  ) => void;
  onDeleteVariableInput: (id: string) => void;
};

export const VariableInput = ({
  integration,
  sourceType,
  mainInputValue,
  mainInputKey,
  dependantInputValue,
  dependantInputKey,
  variableInputsValues,
  onVariableInputsValuesChange,
  onDeleteVariableInput,
}: Props) => {
  const [variableInputSelectorSearch, setVariableInputSelectorSearch] =
    useState('');

  const { data: options, isFetching } = useFieldOptions({
    integration: integration,
    sourceType: sourceType,
    search: '',
    parameters: [
      {
        cacheKey: mainInputKey,
        value: mainInputValue,
      },
      {
        cacheKey: dependantInputKey,
        value: dependantInputValue,
      },
    ],
  });
  const { required, nonRequired } = separateOptions(options.nestedData);

  if (isFetching) {
    return (
      <div className="flex items-center gap-2">
        <LoaderCircle className="size-4 shrink-0 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pl-4 border-l border-gray-200">
      {!isFetching &&
        required.map((o) => (
          <InputSwitch
            key={o.id}
            option={o}
            value={
              o.id in variableInputsValues ? variableInputsValues[o.id] : ''
            }
            onChange={(value) => {
              onVariableInputsValuesChange({ [o.id]: value });
            }}
          />
        ))}
      {nonRequired
        .filter((option) => option.id in variableInputsValues)
        .map((o) => (
          <div key={o.id} className="flex items-end justify-between gap-2">
            <InputSwitch
              option={o}
              value={variableInputsValues[o.id] || ''}
              onChange={(value) => {
                onVariableInputsValuesChange({ [o.id]: value });
              }}
            />
            <Button
              variant="ghost"
              onClick={() => {
                onDeleteVariableInput(o.id);
              }}
            >
              <MinusCircleIcon />
            </Button>
          </div>
        ))}
      {!isFetching && nonRequired.length && (
        <ComboboxField
          id={`${integration}-custom-variable-field-selector`}
          title="Add field"
          required={false}
          value={variableInputSelectorSearch}
          placeholder={variableInputSelectorSearch || 'Select an option...'}
          onSelect={(fieldId) => {
            if (!fieldId) return;

            setVariableInputSelectorSearch('');
            onVariableInputsValuesChange({ [fieldId]: '' });
          }}
          isFetching={isFetching}
          onDebouncedChange={setVariableInputSelectorSearch}
        >
          {nonRequired
            .filter((option) => !(option.id in variableInputsValues))
            .filter((option) =>
              option?.title
                ?.toLowerCase()
                .includes(variableInputSelectorSearch.toLowerCase())
            )
            .map((option) => {
              return (
                <ComboboxField.Item key={option.id} value={option.id}>
                  {option.title}
                </ComboboxField.Item>
              );
            })}
        </ComboboxField>
      )}
    </div>
  );
};

const InputSwitch = ({
  option,
  value,
  onChange,
}: {
  value: VariableInputValue;
  onChange: (value: VariableInputValue) => void;
  option: DynamicDefaultInput;
}) => {
  switch (option.type) {
    case 'multi':
    case 'multiCheckbox':
      return (
        <MultiSelectField
          id={option.id}
          title={option.title}
          required={option.required}
          value={(value || []) as string[]}
          onChange={onChange}
          allowClear
        >
          {option.items &&
            option.items.map((option) => (
              <MultiSelectField.Item key={option.value} value={option.value}>
                {option.label}
              </MultiSelectField.Item>
            ))}
        </MultiSelectField>
      );
    case 'dropdown':
      return (
        <SelectField
          id={option.id}
          title={option.title}
          required={option.required}
          value={(value || '') as string}
          onChange={(value) => onChange(value ?? undefined)}
          allowClear
        >
          {option.items &&
            option.items.map((option) => (
              <SelectField.Item key={option.value} value={option.value}>
                {option.label}
              </SelectField.Item>
            ))}
        </SelectField>
      );
    case 'number':
      return (
        <TextInputField
          id={option.id}
          type={'number'}
          title={option.title}
          value={(value || '') as string}
          onChange={onChange}
          disabled={false}
          required={option.required}
        />
      );
    case 'string':
      return (
        <TextInputField
          id={option.id}
          type={'text'}
          title={option.title}
          value={(value || '') as string}
          onChange={onChange}
          disabled={false}
          required={option.required}
        />
      );
    default:
      return null;
  }
};

const separateOptions = <T extends { required: boolean }>(options: T[]) => {
  const organized: { required: T[]; nonRequired: T[] } = {
    required: [],
    nonRequired: [],
  };

  for (const option of options) {
    if (option.required) {
      organized.required.push(option);
    } else {
      organized.nonRequired.push(option);
    }
  }

  return organized;
};
