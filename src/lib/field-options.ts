import type { EnumInputValue, EnumSection } from '@useparagon/connect';

export type FieldOptionsData = EnumInputValue[] | EnumSection[];

export function isEnumSection(
  item: EnumInputValue | EnumSection,
): item is EnumSection {
  return (
    typeof item === 'object' &&
    item !== null &&
    'items' in item &&
    'title' in item &&
    Array.isArray((item as EnumSection).items)
  );
}

export function flattenFieldOptions(data: FieldOptionsData): EnumInputValue[] {
  return data.flatMap((entry) => (isEnumSection(entry) ? entry.items : [entry]));
}

/**
 * Returns the section list when `data` is grouped, otherwise `null`.
 * Callers can use this to decide between rendering with `<CommandGroup>`
 * headings and rendering a flat list.
 */
export function getFieldOptionSections(
  data: FieldOptionsData,
): EnumSection[] | null {
  if (data.length === 0) return null;
  return data.every(isEnumSection) ? (data as EnumSection[]) : null;
}

export function findFieldOption(
  data: FieldOptionsData,
  value: unknown,
): EnumInputValue | undefined {
  return flattenFieldOptions(data).find((option) => option.value === value);
}
