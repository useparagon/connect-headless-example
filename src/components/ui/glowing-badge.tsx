import { CredentialStatus } from '@useparagon/connect';
import { cn } from '@/lib/utils';

type GlowingBadgeProps = {
  status: CredentialStatus;
};

export function GlowingBadge(props: GlowingBadgeProps) {
  const lightColor =
    props.status === CredentialStatus.VALID ? 'bg-green-300' : 'bg-red-300';
  const darkColor =
    props.status === CredentialStatus.VALID ? 'bg-green-400' : 'bg-red-400';

  return (
    <span className="relative flex size-3">
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 shadow-sm',
          lightColor,
        )}
      ></span>
      <span
        className={cn(
          'relative inline-flex size-3 rounded-full shadow-sm',
          darkColor,
        )}
      ></span>
    </span>
  );
}
