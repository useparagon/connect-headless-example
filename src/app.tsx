import { useQuery } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export function App() {
  const user = paragon.getUser();
  const { data: integrations, isLoading } = useIntegrationMetadata();

  if (isLoading || !integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <header className="flex items-center py-4 px-8 border-b border-border">
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
      </header>

      <div className="py-4 px-8">
        <h1 className="text-2xl font-medium mb-4">Integrations</h1>
        <ul className="flex flex-wrap gap-4">
          {integrations.map((integration) => {
            const integrationEnabled =
              user.authenticated &&
              user.integrations[integration.type]?.enabled;

            return (
              <li key={integration.type}>
                <Card className="min-w-[300px] hover:shadow-sm transition-shadow">
                  <CardContent>
                    <CardTitle>
                      <div className="flex gap-2 items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <img src={integration.icon} width={30} />
                          {integration.name}
                        </div>
                        <Button onClick={() => {}} className="cursor-pointer">
                          {integrationEnabled ? 'Manage' : 'Enable'}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function useIntegrationMetadata() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => {
      return paragon.getIntegrationMetadata();
    },
  });
}
