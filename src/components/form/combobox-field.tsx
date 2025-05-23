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
  disabled?: boolean;
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
      <div className="w-full flex flex-col gap-1.5">
        <FieldLabel id={props.id} required={props.required}>
          {props.title}
        </FieldLabel>
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger disabled={props.disabled}>
            <Button
              disabled={props.disabled}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between group"
              onClick={() => {
                setOpen(true);
              }}
            >
              <span className="flex-1 text-left">
                {props.isFetching && value ? (
                  <Spinner withText />
                ) : (
                  props.placeholder
                )}
              </span>
              <div className="flex items-center gap-1">
                {props.allowClear && value && (
                  <button
                    onClick={clearSelection}
                    aria-label="Clear selection"
                    className="cursor-pointer opacity-50 hover:opacity-80 focus-visible:opacity-80 transition-opacity"
                  >
                    <CircleX className="h-4 w-4" />
                  </button>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search"
                onValueChange={handleDebouncedChange}
                leadingIcon={props.isFetching ? <Spinner /> : null}
              />
              <CommandList>
                <CommandEmpty>
                  {props.isFetching ? null : 'No option found.'}
                </CommandEmpty>
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
  value: string;
  children: ReactNode;
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
          'mr-2 h-4 w-4 transition-opacity',
          context.selectedValue === props.value ? 'opacity-100' : 'opacity-0',
        )}
      />
      {props.children}
    </CommandItem>
  );
}

function Spinner({ withText = false }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <LoaderCircle className="size-4 shrink-0 animate-spin" />
      {withText && 'Loading...'}
    </div>
  );
}
