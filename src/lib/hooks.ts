import { useQuery } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';

export function useIntegrationMetadata() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => {
      return paragon.getIntegrationMetadata();
    },
  });
}

export function useIntegrationConfig(type: string) {
  return useQuery({
    queryKey: ['integrationConfig', type],
    queryFn: () => {
      return paragon.getIntegrationConfig(type);
    },
  });
}

export function useAuthenticatedUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const user = paragon.getUser();
      if (!user.authenticated) {
        throw new Error('User is not authenticated');
      }

      return user;
    },
  });
}

const fieldOptionsInitialData = { data: [], nextPageCursor: null };

export function useFieldOptions(
  integration: string,
  sourceType: string,
  search?: string,
) {
  return useQuery({
    queryKey: ['fieldOptions', integration, sourceType],
    queryFn: () => {
      return paragon.getFieldOptions(integration, sourceType, search);
    },
    initialData: fieldOptionsInitialData,
  });
}
