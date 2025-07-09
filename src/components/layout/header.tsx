import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/themes/theme-provider';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between py-4 px-8 border-b border-border border-dashed">
      <div className="flex items-center">
        <img
          src="https://dashboard.useparagon.com/images/icons/paragon-no-text.svg"
          className="w-7 h-7 mr-2"
        />
        <div
          className="text-sm font-bold mr-8"
          style={{ lineHeight: '1.1rem' }}
        >
          Paragon{' '}
          <p
            className="text-xs opacity-70 uppercase font-extrabold"
            style={{ fontSize: 10 }}
          >
            Headless Connect
          </p>
        </div>
      </div>

      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
        >
          {theme === 'dark' ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
