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
import { cva, VariantProps } from 'class-variance-authority';

const comboboxVariants = cva('flex flex-col gap-1.5', {
  variants: {
    size: {
      default: 'w-full',
      sm: 'w-3xs',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type Props = {
  id: string;
  required: boolean;
  value: string | null;
  placeholder: string | null;
  children: ReactNode;
  isFetching: boolean;
  onSelect: (value: string | null) => void;
  onDebouncedChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  subtitle?: React.ReactNode;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  renderValue?: (value: string | null) => ReactNode;
} & VariantProps<typeof comboboxVariants>;

type ComboboxFieldContext = {
  selectedValue: string | null;
  onChange: (value: string) => void;
};

const ComboboxFieldContext = createContext<null | ComboboxFieldContext>(null);

export function ComboboxField({ size, className, ...props }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    props.onOpenChange?.(open);
  }, [open]);

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        selectedValue: props.value,
        onChange: (value) => {
          props.onSelect(value);
          setOpen(false);
        },
      }}
    >
      <div className={cn(comboboxVariants({ size, className }))}>
        {props.title && (
          <FieldLabel id={props.id} required={props.required}>
            {props.title}
          </FieldLabel>
        )}
        {props.subtitle ? (
          <p className="text-sm text-gray-500">{props.subtitle}</p>
        ) : null}
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger disabled={props.disabled} asChild>
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
              <span
                className={cn(
                  'flex-1 text-left',
                  props.value
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400 dark:text-neutral-500',
                )}
              >
                {props.isFetching && props.value ? (
                  <Spinner withText />
                ) : props.value ? (
                  props.renderValue ? (
                    props.renderValue?.(props.value)
                  ) : (
                    props.value
                  )
                ) : (
                  props.placeholder
                )}
              </span>
              <div className="flex items-center gap-1">
                {props.allowClear && props.value && (
                  <span
                    onClick={clearSelection}
                    aria-label="Clear selection"
                    className="cursor-pointer opacity-50 hover:opacity-80 focus-visible:opacity-80 transition-opacity"
                  >
                    <CircleX className="h-4 w-4" />
                  </span>
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
    <CommandItem
      value={props.value}
      onSelect={() => context.onChange(props.value)}
    >
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
