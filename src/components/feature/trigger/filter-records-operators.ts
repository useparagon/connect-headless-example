import { Operator } from '@useparagon/connect';

export const OPERATOR_LABELS: Record<string, string> = {
  [Operator.StringContains]: 'contains',
  [Operator.StringDoesNotContain]: 'does not contain',
  [Operator.StringExactlyMatches]: 'exactly matches',
  [Operator.StringDoesNotExactlyMatch]: 'does not exactly match',
  [Operator.StringIsIn]: 'is in',
  [Operator.StringIsNotIn]: 'is not in',
  [Operator.StringStartsWith]: 'starts with',
  [Operator.StringDoesNotStartWith]: 'does not start with',
  [Operator.StringEndsWith]: 'ends with',
  [Operator.StringDoesNotEndWith]: 'does not end with',
  [Operator.StringGreaterThan]: 'greater than',
  [Operator.StringLessThan]: 'less than',
  [Operator.NumberGreaterThan]: 'greater than',
  [Operator.NumberLessThan]: 'less than',
  [Operator.NumberEquals]: 'equals',
  [Operator.NumberDoesNotEqual]: 'does not equal',
  [Operator.NumberLessThanOrEqualTo]: 'less than or equal to',
  [Operator.NumberGreaterThanOrEqualTo]: 'greater than or equal to',
  [Operator.DateTimeAfter]: 'after',
  [Operator.DateTimeBefore]: 'before',
  [Operator.DateTimeEquals]: 'date equals',
  [Operator.BooleanTrue]: 'is true',
  [Operator.BooleanFalse]: 'is false',
  [Operator.IsNotNull]: 'is not null',
  [Operator.IsNull]: 'is null',
  [Operator.Exists]: 'exists',
  [Operator.DoesNotExist]: 'does not exist',
  [Operator.ArrayIsIn]: 'array contains',
  [Operator.ArrayIsNotIn]: 'array does not contain',
  [Operator.ArrayIsEmpty]: 'is empty',
  [Operator.ArrayIsNotEmpty]: 'is not empty',
};

// The SDK does not export the OPERATORS metadata table, so we mirror it here:
// these are the operators whose semantics are a unary check (no right-hand value).
const OPERATORS_WITHOUT_ARGUMENT = new Set<string>([
  Operator.None,
  Operator.BooleanTrue,
  Operator.BooleanFalse,
  Operator.IsNotNull,
  Operator.IsNull,
  Operator.Exists,
  Operator.DoesNotExist,
  Operator.ArrayIsEmpty,
  Operator.ArrayIsNotEmpty,
]);

export function operatorHasArgument(op: string): boolean {
  if (!op) return false;
  return !OPERATORS_WITHOUT_ARGUMENT.has(op);
}
