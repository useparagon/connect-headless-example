import type { ReactNode } from 'react';

import { FileUpload } from '@/components/ui/file-upload';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: File | null;
  subtitle?: ReactNode;
  tooltip?: ReactNode;
  onChange: (value: File | null) => void;
};

export function FileUploadField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      {props.subtitle ? (
        <p className="text-sm text-gray-500">{props.subtitle}</p>
      ) : null}
      <FileUpload
        id={props.id}
        currentFile={props.value}
        onFileRemove={() => props.onChange(null)}
        onUploadSuccess={props.onChange}
        onUploadError={(error) => console.error(error)}
      />
    </div>
  );
}
