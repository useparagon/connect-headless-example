import { ReactNode } from 'react';

import { FieldLabel } from './field-label';
import { cn } from '@/lib/utils';

type Props = {
  id: string;
  title: string;
  subtitle?: ReactNode;
  required: boolean;
  tooltip?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export function CodeInputField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel id={props.id} required={props.required} tooltip={props.tooltip}>
        {props.title}
      </FieldLabel>
      {props.subtitle ? (
        <p className="text-sm text-gray-500">{props.subtitle}</p>
      ) : null}
      <textarea
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        readOnly={props.readOnly}
        spellCheck={false}
        className={cn(
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-2 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'font-mono leading-5 min-h-[160px] resize-y',
          props.className
        )}
      />
    </div>
  );
}


