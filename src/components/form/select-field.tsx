import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectContent,
  Select,
  SelectTrigger,
} from '@/components/ui/select';

import { FieldLabel } from './field-label';
import { X } from 'lucide-react';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  children: ReactNode;
  allowClear?: boolean;
  subtitle?: ReactNode;
  tooltip?: ReactNode;
};

export function SelectField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={props.id} required={props.required} tooltip={props.tooltip}>
        {props.title}
      </FieldLabel>
      {props.subtitle ? (
        <p className="text-sm text-gray-500">{props.subtitle}</p>
      ) : null}
      <div className="flex gap-2">
        <Select value={props.value ?? ''} onValueChange={props.onChange}>
          <SelectTrigger className="w-[180px]" id={props.id}>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>{props.children}</SelectGroup>
          </SelectContent>
        </Select>
        {props.allowClear && props.value ? (
          <Button
            variant="link"
            size="icon"
            className="text-foreground"
            onClick={() => props.onChange(null)}
          >
            <X className="size-4" />
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
