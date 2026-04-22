import type { EnumInputValue } from '@useparagon/connect';

import { CommandGroup } from '@/components/ui/command';
import { ComboboxField } from '@/components/form/combobox-field';
import {
  type FieldOptionsData,
  getFieldOptionSections,
} from '@/lib/field-options';

type Props = {
  data: FieldOptionsData;
};

/**
 * Renders combobox items either as a flat list of `<ComboboxField.Item>`s
 * or, when `data` contains `EnumSection`s, as labelled `<CommandGroup>`s.
 */
export function ComboboxOptions({ data }: Props) {
  const sections = getFieldOptionSections(data);

  if (sections) {
    return (
      <>
        {sections.map((section) => (
          <CommandGroup key={section.title} heading={section.title}>
            {section.items.map(renderItem)}
          </CommandGroup>
        ))}
      </>
    );
  }

  return <>{(data as EnumInputValue[]).map(renderItem)}</>;
}

function renderItem(option: EnumInputValue) {
  return (
    <ComboboxField.Item key={String(option.value)} value={String(option.value)}>
      {option.label}
    </ComboboxField.Item>
  );
}
