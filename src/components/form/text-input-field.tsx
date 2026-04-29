import { ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { FieldLabel } from './field-label';
import { cn } from '@/lib/utils';

type Props = {
  id: string;
  title: string;
  subtitle?: ReactNode;
  required: boolean;
  type: 'text' | 'number' | 'email' | 'password' | 'url';
  tooltip?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
};

const LINK_PATTERN = /^(.*?)\((https?:\/\/[^)]+)\)(.*)$/;

function Subtitle({ children }: { children: ReactNode }) {
  if (typeof children !== 'string') {
    return <p className="text-sm text-muted-foreground">{children}</p>;
  }

  const match = children.match(LINK_PATTERN);
  if (!match) {
    return <p className="text-sm text-muted-foreground">{children}</p>;
  }

  const [, before, url, after] = match;
  return (
    <p className="text-sm text-muted-foreground">
      {before}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2"
      >
        🔗
      </a>
      {after}
    </p>
  );
}

export function TextInputField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      {props.subtitle ? <Subtitle>{props.subtitle}</Subtitle> : null}
      <Input
        id={props.id}
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        readOnly={props.readOnly}
        className={cn(props.className, 'placeholder:text-muted-foreground/30')}
        placeholder={props.placeholder}
      />
    </div>
  );
}
