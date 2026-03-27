import {
  SidebarInputType,
  type DefaultFieldValueSources,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useState } from 'react';

import {
  PaginatedCombobox,
  StaticComboDropdown,
} from '@/components/form/paginated-combobox';
import { hasSourcePagination, useSourcesForInput } from '@/lib/hooks';
import { FieldLabel } from '../form/field-label';

export type ComboInputValue = {
  mainInput: string | undefined;
  dependentInput: string | undefined;
};

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.ComboInput>;
  required: boolean;
  value: ComboInputValue;
  onChange: (value: ComboInputValue) => void;
};

export function ComboInputField(props: Props) {
  const [mainInputSearch, setMainInputSearch] = useState('');
  const [dependentInputSearch, setDependentInputSearch] = useState('');

  const sources = useSourcesForInput(props.integration, props.field);

  const comboSources =
    sources?.kind === 'defaultFieldValue'
      ? (sources as DefaultFieldValueSources)
      : null;

  const mainInputMeta = comboSources?.mainInputSource;
  const dependentInputMeta = comboSources?.dependentInputSource;

  if (!mainInputMeta || !dependentInputMeta) {
    return null;
  }

  const MainDropdown = hasSourcePagination(mainInputMeta)
    ? PaginatedCombobox
    : StaticComboDropdown;

  const DependentDropdown = hasSourcePagination(dependentInputMeta)
    ? PaginatedCombobox
    : StaticComboDropdown;

  return (
    <>
      <FieldLabel id={props.field.id} required={props.required}>
        {props.field.title}
      </FieldLabel>
      <div className="w-full flex gap-4">
        <MainDropdown
          id={props.field.id}
          title={mainInputMeta.title}
          required={props.required}
          value={props.value.mainInput ?? null}
          onSelect={(value) =>
            props.onChange({
              mainInput: value ?? undefined,
              dependentInput: undefined,
            })
          }
          search={mainInputSearch}
          onSearchChange={setMainInputSearch}
          integration={props.integration}
          source={mainInputMeta}
          allowClear
        />
        <DependentDropdown
          id={props.field.id}
          title={dependentInputMeta.title}
          required={props.required}
          value={props.value.dependentInput ?? null}
          onSelect={(value) =>
            props.onChange({
              mainInput: props.value.mainInput,
              dependentInput: value ?? undefined,
            })
          }
          search={dependentInputSearch}
          onSearchChange={setDependentInputSearch}
          integration={props.integration}
          source={dependentInputMeta}
          parameters={[
            {
              cacheKey: mainInputMeta.cacheKey as string,
              value: props.value.mainInput,
            },
          ]}
          enabled={Boolean(props.value.mainInput)}
          disabled={!props.value.mainInput}
          allowClear
        />
      </div>
    </>
  );
}
