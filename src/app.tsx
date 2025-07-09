import { Header } from '@/components/layout/header';

import { ThemeProvider } from '@/lib/themes/theme-provider';
import { IntegrationList } from './components/feature/integration/integration-list';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <div>
        <Header />
        <div className="container mx-auto py-4 px-8">
          <IntegrationList />
        </div>
      </div>
    </ThemeProvider>
  );
}
