import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  paragon,
  type DynamicDataSource,
  type SerializedConnectInput,
} from '@useparagon/connect';

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
  nestedData: [],
  nextPageCursor: null,
};

export function useSourcesForInput(
  integration: string,
  action: string | undefined,
  input: SerializedConnectInput,
) {
  return useMemo(
    () =>
      action ? paragon.getSourcesForInput(integration, action, input) : null,
    [integration, action, input],
  );
}

export function useFieldOptions({
  integration,
  source,
  sourceType,
  search,
  cursor,
  parameters = [],
  enabled = true,
}: {
  integration: string;
  source?: DynamicDataSource<any>;
  sourceType?: string;
  search?: string;
  cursor?: string | number | false;
  parameters?: { cacheKey: string; value: string | undefined }[];
  enabled?: boolean;
}) {
  const queryKey = source?.cacheKey ?? sourceType;

  return useQuery({
    enabled: enabled && !!queryKey,
    queryKey: ['fieldOptions', integration, queryKey, search, parameters],
    queryFn: () => {
      const mappedParameters = parameters.map((parameter) => ({
        key: parameter.cacheKey,
        source: {
          type: 'VALUE' as const,
          value: parameter.value,
        },
      }));

      if (source) {
        return paragon.getFieldOptions({
          integration,
          source,
          search,
          cursor,
          parameters: mappedParameters,
        });
      }

      if (sourceType) {
        return paragon.getFieldOptions({
          integration,
          action: sourceType,
          search,
          cursor,
          parameters: mappedParameters,
        });
      }

      return fieldOptionsInitialData;
    },
    initialData: fieldOptionsInitialData,
  });
}

export function useDataSourceOptions<T>(
  integration: string,
  sourceType: string,
) {
  return useQuery({
    queryKey: ['comboInputOptions', integration, sourceType],
    queryFn: () => {
      return paragon.getDataSourceOptions(integration, sourceType) as T;
    },
  });
}
