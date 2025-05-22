import { useQuery } from '@tanstack/react-query';
import { KeyedSource, DataType, paragon } from '@useparagon/connect';

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

type FieldOptionsResponse = Awaited<ReturnType<typeof paragon.getFieldOptions>>;

const fieldOptionsInitialData: FieldOptionsResponse = {
  data: [],
  nextPageCursor: null,
};

export function useFieldOptions({
  integration,
  sourceType,
  search,
  cursor,
  parameters = [],
}: {
  integration: string;
  sourceType: string;
  search?: string;
  cursor?: string | number | false;
  parameters?: KeyedSource<DataType.ANY>[];
}) {
  return useQuery({
    queryKey: ['fieldOptions', integration, sourceType, search, parameters],
    queryFn: () => {
      return paragon.getFieldOptions({
        integration,
        action: sourceType,
        search,
        cursor,
        parameters,
      });
    },
    initialData: fieldOptionsInitialData,
  });
}

export function useComboInputOptions(integration: string, sourceType: string) {
  return useQuery({
    queryKey: ['comboInputOptions', integration, sourceType],
    queryFn: () => {
      return paragon.getComboInputOptions(integration, sourceType);
    },
  });
}
