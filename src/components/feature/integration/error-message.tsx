import { useMemo } from 'react';
import { InstallFlowError } from '@useparagon/connect';

export function ErrorMessage(props: { error: InstallFlowError | null }) {
  const errorMessage = useMemo(() => {
    if (!props.error) {
      return null;
    }

    if (props.error.name === 'UnknownError') {
      return props.error.originalError instanceof Error
        ? props.error.originalError.message
        : 'Something went wrong';
    }

    return props.error.message;
  }, [props.error]);

  const formattedError = useMemo(() => {
    if (!errorMessage) {
      return null;
    }

    try {
      return JSON.stringify(JSON.parse(errorMessage), null, 2);
    } catch (error) {
      console.error('Error while parsing error message', error);
      return errorMessage;
    }
  }, [errorMessage]);

  if (!errorMessage) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <pre className="text-destructive max-w-full text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20">
        {formattedError}
      </pre>
    </div>
  );
}
