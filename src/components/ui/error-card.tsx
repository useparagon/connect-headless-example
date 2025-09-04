import { ZodError } from 'zod';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

export function ErrorCard(props: {
  error: unknown | null;
  onRetry: () => void;
}) {
  const error =
    props.error instanceof Error
      ? props.error
      : new Error('Something went wrong while authenticating');
  const zodError = error instanceof ZodError ? error : null;

  return (
    <div className="max-w-md mx-auto pt-4">
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center text-destructive gap-2">
            <AlertTriangleIcon className="size-5" />{' '}
            {zodError
              ? 'Invalid environment variables'
              : 'Error while authenticating'}
          </CardTitle>
          <CardAction>
            <Button onClick={props.onRetry}>Retry</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {zodError ? (
              <>
                <p className="mb-2">
                  Make sure you have the following environment variables set in
                  your <span className="font-mono">.env</span> file:
                </p>
                <ul className="list-disc list-inside">
                  {zodError.issues.map((issue) => (
                    <li key={issue.path.join('.')} className="font-mono">
                      {issue.path.join('.')}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              error.message
            )}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
