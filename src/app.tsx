import { Header } from '@/components/layout/header';
import { paragon } from '@useparagon/connect';
import { useQuery } from '@tanstack/react-query';

import { getAppConfig } from '@/lib/config';
import { ThemeProvider } from '@/lib/themes/theme-provider';
import { IntegrationList } from '@/components/feature/integration/integration-list';
import { IntegrationCard } from '@/components/feature/integration/integration-card';
import { ErrorCard } from '@/components/ui/error-card';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div>
        <Header />
        <div className="container mx-auto py-4 px-8">
          <AuthenticatedApp />
        </div>
      </div>
    </ThemeProvider>
  );
}

async function authenticate() {
  const config = getAppConfig();

  if (!config.success) {
    throw config.error;
  }

  await paragon.authenticate(
    config.data.VITE_PARAGON_PROJECT_ID,
    config.data.VITE_PARAGON_JWT_TOKEN,
  );
  paragon.setHeadless(true);

  paragon.setDataSources({
    // Static dropdown options (available to all integrations)
    dropdowns: {
      'priority-level': [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      'pokemon-picker': {
        loadOptions: async (cursor, search) => {
          const offset = cursor ? parseInt(cursor, 10) : 0;
          const limit = 20;
          const res = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
          );
          const data = await res.json();
          const options = data.results.map((p: any) => ({
            label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
            value: p.name,
          }));
          const filtered = search
            ? options.filter((o: any) =>
                o.label.toLowerCase().includes(search.toLowerCase()),
              )
            : options;
          const nextPageCursor = data.next ? String(offset + limit) : null;
          return { options: filtered, nextPageCursor };
        },
      },
    },

    // Field mapping sources (available to all integrations)
    mapObjectFields: {
      // Static field mapping
      Test: {
        fields: [
          { label: 'Title', value: 'title' },
          { label: 'Description', value: 'description' },
          { label: 'Completed?', value: 'isCompleted' },
        ],
      },

      // Dynamic field mapping (PokeAPI)
      Task: {
        objectTypes: {
          get: async (cursor, search) => {
            const offset = cursor ? parseInt(cursor, 10) : 0;
            const limit = 10;
            const res = await fetch(
              `https://pokeapi.co/api/v2/type?limit=${limit}&offset=${offset}`,
            );
            const data = await res.json();
            const options = data.results.map((t: any) => ({
              label: t.name.charAt(0).toUpperCase() + t.name.slice(1),
              value: t.url.split('/').filter(Boolean).pop(),
            }));
            const filtered = search
              ? options.filter((o: any) =>
                  o.label.toLowerCase().includes(search.toLowerCase()),
                )
              : options;
            const nextPageCursor = data.next ? String(offset + limit) : null;
            return { options: filtered, nextPageCursor };
          },
        },
        integrationFields: {
          get: async ({ objectType }, cursor, search) => {
            const offset = cursor ? parseInt(cursor, 10) : 0;
            const limit = 20;
            const res = await fetch(
              `https://pokeapi.co/api/v2/type/${objectType}`,
            );
            const data = await res.json();
            const all = data.pokemon.map((p: any) => ({
              label:
                p.pokemon.name.charAt(0).toUpperCase() +
                p.pokemon.name.slice(1),
              value: p.pokemon.name,
            }));
            const filtered = search
              ? all.filter((o: any) =>
                  o.label.toLowerCase().includes(search.toLowerCase()),
                )
              : all;
            const page = filtered.slice(offset, offset + limit);
            const nextPageCursor =
              offset + limit < filtered.length ? String(offset + limit) : null;
            return { options: page, nextPageCursor };
          },
        },
        applicationFields: {
          fields: [
            { label: 'Name', value: 'name' },
            { label: 'Type', value: 'type' },
            { label: 'Base Experience', value: 'base_experience' },
          ],
          defaultFields: [],
          userCanRemoveMappings: true,
        },
      },
    },

    // Integration-specific sources (override global sources for a given integration)
    integrationSpecificSources: {
      jira: {
        dropdowns: {
          'priority-level': [
            { label: 'Lowest', value: 'lowest' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Highest', value: 'highest' },
          ],
        },
      },
    },
  });

  return null;
}

function AuthenticatedApp() {
  const {
    isLoading,
    error,
    refetch: reauthenticate,
  } = useQuery({
    queryKey: ['authentication'],
    queryFn: authenticate,
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-medium mb-4">Integrations</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorCard error={error} onRetry={reauthenticate} />;
  }

  return <IntegrationList />;
}
