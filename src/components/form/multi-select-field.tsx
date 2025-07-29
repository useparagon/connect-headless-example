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

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  children: ReactNode;
  allowClear?: boolean;
};

export function MultiSelectField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={props.id} required={props.required}>
        {props.title}
      </FieldLabel>
      <div className="flex gap-2">
        <Select
          value={props.value.join(', ')}
          onValueChange={(val) => {
            if (props.value.includes(val)) {
              props.onChange(props.value.filter((v) => v !== val));
            } else {
              props.onChange([...props.value, val]);
            }
          }}
        >
          <SelectTrigger className="w-[180px]" id={props.id}>
            <SelectValue placeholder="Select items">
              {props.value.length ? props.value.join(', ') : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>{props.children}</SelectGroup>
          </SelectContent>
        </Select>
        {props.allowClear && props.value.length > 0 ? (
          <Button
            variant="link"
            size="icon"
            className="text-foreground"
            onClick={() => props.onChange([])}
          >
            clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

MultiSelectField.Item = Item;

type SelectItemProps = {
  value: string;
  children: ReactNode;
};

function Item(props: SelectItemProps) {
  return <SelectItem value={props.value}>{props.children}</SelectItem>;
}
