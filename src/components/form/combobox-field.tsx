import { debounce } from 'lodash';
import { Check, ChevronsUpDown, CircleX, LoaderCircle } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
import { cn } from '@/lib/utils';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string | null;
  placeholder: string | null;
  children: ReactNode;
  isFetching: boolean;
  onSelect: (value: string | null) => void;
  allowClear?: boolean;
  onDebouncedChange: (value: string) => void;
};

type ComboboxFieldContext = {
  selectedValue: string | null;
  setValue: (value: string) => void;
};

const ComboboxFieldContext = createContext<null | ComboboxFieldContext>(null);

export function ComboboxField(props: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.value);

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(null);
    props.onSelect(null);
  };

  const handleDebouncedChange = useMemo(() => {
    return debounce(props.onDebouncedChange, 500);
  }, [props.onDebouncedChange]);

  useEffect(() => {
    handleDebouncedChange.cancel();
  }, [handleDebouncedChange]);

  return (
    <ComboboxFieldContext.Provider
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
        <Popover open={open} onOpenChange={setOpen} modal>
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
                {value ? (
                  props.isFetching ? (
                    <div className="flex items-center gap-1">
                      <LoaderCircle className="h-4 w-4 animate-spin" />{' '}
                      Loading...
                    </div>
                  ) : (
                    props.placeholder
                  )
                ) : (
                  'Select option...'
                )}
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
              <CommandInput
                placeholder="Search option..."
                onValueChange={handleDebouncedChange}
              />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>{props.children}</CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </ComboboxFieldContext.Provider>
  );
}

ComboboxField.Item = Item;

type ComboboxItemProps = {
  label: string;
  value: string;
};

function Item(props: ComboboxItemProps) {
  const context = useContext(ComboboxFieldContext);

  if (!context) {
    throw 'Missing provider';
  }

  return (
    <CommandItem onSelect={() => context.setValue(props.value)}>
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
