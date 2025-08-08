import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldLabel } from '@/components/form/field-label';

type SupportedOperator = string;

type Props = {
  field: {
    id: string;
    title: string;
    subtitle?: string;
    supportedKeys: string[];
    supportedOperators: SupportedOperator[];
  };
  required: boolean;
  value: JoinNode | null | undefined;
  onChange: (value: JoinNode) => void;
};

type JoinType = 'AND' | 'OR';

type OperatorCondition = {
  operator: SupportedOperator;
  field?: string;
  value?: string;
};

type JoinNode = {
  operator: JoinType;
  conditions: Array<JoinNode | OperatorCondition>;
};

export function ConditionalInputField({
  field,
  required,
  value,
  onChange,
}: Props) {
  const root: JoinNode = value ?? createEmptyRoot(field);

  const handleRootChange = (updated: JoinNode) => {
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel id={field.id} required={required}>
        {field.title}
      </FieldLabel>
      {field.subtitle ? (
        <p className="text-sm text-muted-foreground">{field.subtitle}</p>
      ) : null}

      {/* First group */}
      {root.conditions.map((group, groupIndex) => {
        if (!('operator' in group)) return null;
        return (
          <div key={groupIndex} className="flex flex-col gap-2">
            {groupIndex > 0 ? (
              <p className="text-sm text-muted-foreground">Or if…</p>
            ) : null}
            <div className="flex flex-col gap-1">
              {(group as JoinNode).conditions.map(
                (c: JoinNode | OperatorCondition, conditionIndex: number) => {
                  if ('operator' in c && 'conditions' in (c as JoinNode))
                    return null;
                  const currentKey = readConditionKey(c, field.supportedKeys);
                  const currentOperator = (c as OperatorCondition).operator;
                  const requiresArg = operatorRequiresArgument(currentOperator);
                  const currentArgument = (c as OperatorCondition).value ?? '';

                  return (
                    <div
                      key={conditionIndex}
                      className="flex gap-3 items-start"
                    >
                      <InlineSelect
                        value={currentKey ?? ''}
                        onChange={(newKey) =>
                          handleRootChange(
                            updateCondition(root, groupIndex, conditionIndex, {
                              key: newKey,
                            }),
                          )
                        }
                        options={field.supportedKeys.map((k) => ({
                          value: k,
                          label: formatKeyLabel(k),
                        }))}
                        placeholder="Select key"
                        className="w-56"
                      />
                      <InlineSelect
                        value={currentOperator}
                        onChange={(op) =>
                          handleRootChange(
                            updateCondition(root, groupIndex, conditionIndex, {
                              operator: op,
                            }),
                          )
                        }
                        options={field.supportedOperators.map((op) => ({
                          value: op,
                          label: humanizeOperator(op),
                        }))}
                        placeholder="Select operator"
                        className="w-56"
                      />
                      <div className="flex-1">
                        {requiresArg ? (
                          <Input
                            placeholder="Enter a value"
                            value={currentArgument}
                            onChange={(e) =>
                              handleRootChange(
                                updateCondition(
                                  root,
                                  groupIndex,
                                  conditionIndex,
                                  {
                                    value: e.target.value,
                                  },
                                ),
                              )
                            }
                          />
                        ) : null}
                      </div>
                      {!(
                        groupIndex === 0 &&
                        (group as JoinNode).conditions.length === 1
                      ) ? (
                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            handleRootChange(
                              removeCondition(root, groupIndex, conditionIndex),
                            )
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  );
                },
              )}
              <div className="ml-2 flex items-center gap-3">
                <Button
                  variant="link"
                  className="p-0 text-indigo-500"
                  onClick={() =>
                    handleRootChange(
                      addCondition(
                        root,
                        groupIndex,
                        createDefaultOperator(field),
                      ),
                    )
                  }
                >
                  + And
                </Button>
                {groupIndex === root.conditions.length - 1 ? (
                  <Button
                    variant="link"
                    className="p-0 text-indigo-500"
                    onClick={() =>
                      handleRootChange(
                        addGroup(root, createDefaultOperator(field)),
                      )
                    }
                  >
                    + Or
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function readConditionKey(
  c: OperatorCondition,
  supportedKeys: string[],
): string | null {
  const raw = c.field ?? null;
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const match = supportedKeys.find((k) => k.toLowerCase() === lower);
  return match ?? raw;
}

function createEmptyRoot(field: Props['field']): JoinNode {
  return {
    operator: 'OR',
    conditions: [
      {
        operator: 'AND',
        conditions: [createDefaultOperator(field)],
      },
    ],
  };
}

function createDefaultOperator(field: Props['field']): OperatorCondition {
  const operator = field.supportedOperators[0];
  return {
    operator,
    field: '',
    value: '',
  };
}

function updateCondition(
  root: JoinNode,
  groupIndex: number,
  conditionIndex: number,
  update: { key: string } | { operator: SupportedOperator } | { value: string },
): JoinNode {
  const clone = structuredClone(root) as JoinNode;
  const group = clone.conditions[groupIndex] as JoinNode;
  const node = group.conditions[conditionIndex] as OperatorCondition;

  if ('key' in update) {
    node.field = update.key;
  } else if ('operator' in update) {
    node.operator = update.operator;
  } else if ('value' in update) {
    node.value = update.value;
  }
  return clone;
}

function removeCondition(
  root: JoinNode,
  groupIndex: number,
  conditionIndex: number,
): JoinNode {
  const clone = structuredClone(root) as JoinNode;
  const group = clone.conditions[groupIndex] as JoinNode;
  group.conditions.splice(conditionIndex, 1);
  if (group.conditions.length === 0) {
    // remove empty group
    clone.conditions.splice(groupIndex, 1);
  }
  return clone;
}

function addCondition(
  root: JoinNode,
  groupIndex: number,
  condition: OperatorCondition,
): JoinNode {
  const clone = structuredClone(root) as JoinNode;
  const group = clone.conditions[groupIndex] as JoinNode;
  group.conditions.push(condition);
  return clone;
}

function addGroup(root: JoinNode, condition: OperatorCondition): JoinNode {
  const clone = structuredClone(root) as JoinNode;
  clone.conditions.push({ operator: 'AND', conditions: [condition] });
  return clone;
}

function operatorRequiresArgument(operator: SupportedOperator): boolean {
  const withoutArg = ['$exists', '$none'];
  return !withoutArg.includes(operator);
}

function humanizeOperator(operator: SupportedOperator): string {
  const raw = operator.replace(/^\$/g, '');
  const parts = raw.split(/(?=[A-Z])/);
  const typePrefix = parts[0]?.toLowerCase();
  const rest = parts.slice(1).join(' ');
  const prefix = typePrefix ? `(${capitalize(typePrefix)}) ` : '';
  return prefix + capitalize(rest);
}

function formatKeyLabel(key: string): string {
  return key
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function InlineSelect({
  value,
  onChange,
  options,
  className,
  placeholder,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}) {
  return (
    <Select value={value ?? ''} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? 'Select'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
