import { Header } from '@/components/layout/header';

import { ThemeProvider } from '@/lib/themes/theme-provider';
import ActionTester from './components/feature/action-tester';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <div>
        <Header />
        <div className="container mx-auto py-4 px-8">
          <ActionTester />
        </div>
      </div>
    </ThemeProvider>
  );
}
