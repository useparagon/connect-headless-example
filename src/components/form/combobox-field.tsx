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
import { createContext, ReactNode, useContext, useState } from 'react';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string | null;
  placeholder: string | null;
  children: ReactNode;
  allowClear?: boolean;
  onSelect: (value: string | null) => void;
};

const comboboxFieldContext = createContext<null | {
  selectedValue: string | null;
  setValue: (value: string) => void;
}>(null);

export function ComboboxField(props: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.value);

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(null);
    props.onSelect(null);
  };

  return (
    <comboboxFieldContext.Provider
      value={{
        selectedValue: value,
        setValue: (value) => {
          setValue(value);
          props.onSelect(value);
          setOpen(false);
        },
      }}
    >
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
                {props.placeholder ?? 'Select option...'}
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
    </comboboxFieldContext.Provider>
  );
}

ComboboxField.Item = Item;

type ComboboxItemProps = {
  label: string;
  value: string;
};

function Item(props: ComboboxItemProps) {
  const context = useContext(comboboxFieldContext);

  if (!context) {
    throw 'Missing provider';
  }

  return (
    <CommandItem
      key={props.value}
      value={props.value}
      onSelect={context.setValue}
    >
      <Check
        className={cn(
          'mr-2 h-4 w-4',
          context.selectedValue === props.value ? 'opacity-100' : 'opacity-0',
        )}
      />
      {props.label}
    </CommandItem>
  );
}
