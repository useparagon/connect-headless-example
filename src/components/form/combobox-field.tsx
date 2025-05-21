import { Check, ChevronsUpDown, CircleX } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FieldLabel } from './field-label';
import { ReactNode, useState } from 'react';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string | null;
  children: ReactNode;
  allowClear?: boolean;
};

export function ComboboxField(props: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.value);

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('');
  };

  return (
    <div className="flex flex-col gap-1 5">
      <FieldLabel id={props.id} required={props.required}>
        {props.title}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between group"
            onClick={() => {
              setOpen(true);
            }}
          >
            <span className="flex-1 text-left">
              {value ?? 'Select option...'}
            </span>
            <div className="flex items-center gap-1">
              {props.allowClear && value && (
                <Button
                  variant="headless"
                  onClick={clearSelection}
                  aria-label="Clear selection"
                >
                  <CircleX className="h-4 w-4 opacity-50" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search option..." />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>{props.children}</CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

ComboboxField.Item = Item;

type ComboboxItemProps = {
  label: string;
  value: string;
};

function Item(props: ComboboxItemProps) {
  return (
    <CommandItem
      key={props.value}
      value={props.value}
      // onSelect={(currentValue) => {
      //   setValue(currentValue === props.value ? '' : currentValue);
      //   setOpen(false);
      // }}
    >
      <Check
        className={cn(
          'mr-2 h-4 w-4',
          // value === props.value ? 'opacity-100' : 'opacity-0',
        )}
      />
      {props.label}
    </CommandItem>
  );
}
