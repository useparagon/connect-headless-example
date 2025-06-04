import { CopyIcon } from 'lucide-react';
import { CheckIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { TextInputField } from './text-input-field';
import { useCallback, useRef, useState } from 'react';

type Props = {
  id: string;
  title: string;
  value: string;
};

export function CopyableInput(props: Props) {
  const [isCopied, setIsCopied] = useTemporaryState(false, 2000);

  return (
    <div className="flex items-end gap-2 w-full">
      <TextInputField
        id={props.id}
        title={props.title}
        required={false}
        type="text"
        value={props.value}
        onChange={noop}
        className="w-full"
        readOnly
      />
      <Button
        onClick={() => {
          navigator.clipboard.writeText(props.value);
          setIsCopied(true);
        }}
        variant="ghost"
        size="icon"
        className="p-2"
      >
        {isCopied ? (
          <CheckIcon className="w-4 h-4 text-green-500" />
        ) : (
          <CopyIcon className="w-4 h-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
}

function useTemporaryState<T>(initialValue: T, duration: number) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const setValueWithTimeout = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setValue(value);

      timeoutRef.current = setTimeout(() => setValue(initialValue), duration);
    },
    [initialValue, duration]
  );

  return [value, setValueWithTimeout] as const;
}

const noop = () => {};
