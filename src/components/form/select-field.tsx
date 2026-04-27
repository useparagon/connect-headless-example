import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectContent,
  Select,
  SelectTrigger,
} from '@/components/ui/select';

import { FieldLabel } from './field-label';

type OptionGroup = {
  title: string;
  items: { label: string; value: string }[];
};

type BaseProps = {
  id: string;
  title: string;
  required: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
  disabled?: boolean;
};

type FlatProps = BaseProps & {
  children: ReactNode;
  groups?: never;
};

type GroupedProps = BaseProps & {
  children?: never;
  groups: OptionGroup[];
};

type Props = FlatProps | GroupedProps;

export function SelectField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={props.id} required={props.required}>
        {props.title}
      </FieldLabel>
      <div className="flex gap-2">
        <Select value={props.value ?? ''} onValueChange={props.onChange} disabled={props.disabled}>
          <SelectTrigger className="w-[180px]" id={props.id}>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {props.groups ? (
              props.groups.map((group) => (
                <SelectGroup key={group.title}>
                  <SelectLabel>{group.title}</SelectLabel>
                  {group.items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            ) : (
              <SelectGroup>{props.children}</SelectGroup>
            )}
          </SelectContent>
        </Select>
        {props.allowClear && props.value ? (
          <Button
            variant="link"
            size="icon"
            className="text-foreground"
            onClick={() => props.onChange(null)}
          >
            clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

SelectField.Item = Item;

type SelectItemProps = {
  value: string;
  children: ReactNode;
};

function Item(props: SelectItemProps) {
  return <SelectItem value={props.value}>{props.children}</SelectItem>;
}
