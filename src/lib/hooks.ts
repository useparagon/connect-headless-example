import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  IntentInputKeyConfig,
  paragon,
  type DynamicDataSource,
  type SerializedConnectInput,
} from '@useparagon/connect';

import { flattenFieldOptions } from './field-options';

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

export function hasSourcePagination(
  source: DynamicDataSource<unknown>,
): boolean {
  return (
    (source as DynamicDataSource<unknown> & { supportPagination?: boolean })
      .supportPagination ?? false
  );
}

export function useSourcesForInput(
  integration: string,
  input: SerializedConnectInput,
) {
  return useMemo(
    () => paragon.getSourcesForInput(integration, input),
    [integration, input],
  );
}

export function useSourcesForTriggerInput(input: IntentInputKeyConfig) {
  return useMemo(() => paragon.getSourcesForActionInput(input), [input]);
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
  source?: DynamicDataSource<unknown>;
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

export function useInfiniteFieldOptions({
  integration,
  source,
  search,
  parameters = [],
  enabled = true,
}: {
  integration: string;
  source?: DynamicDataSource<unknown>;
  search?: string;
  parameters?: { cacheKey: string; value: string | undefined }[];
  enabled?: boolean;
}) {
  const queryKey = source?.cacheKey;

  const query = useInfiniteQuery({
    enabled: enabled && !!queryKey,
    queryKey: [
      'infiniteFieldOptions',
      integration,
      queryKey,
      search,
      parameters,
    ],
    queryFn: ({ pageParam }) => {
      const mappedParameters = parameters.map((parameter) => ({
        key: parameter.cacheKey,
        source: {
          type: 'VALUE' as const,
          value: parameter.value,
        },
      }));

      return paragon.getFieldOptions({
        integration,
        source: source!,
        search,
        cursor: pageParam,
        parameters: mappedParameters,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPageCursor ?? undefined,
  });

  const flatData = useMemo(
    () =>
      query.data?.pages.flatMap((page) => flattenFieldOptions(page.data)) ?? [],
    [query.data?.pages],
  );

  return {
    data: flatData,
    pages: query.data?.pages ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetching: query.isFetching,
  };
}

export function useTriggerTypes(
  integration: string,
  selectedCredentialId?: string,
) {
  return useQuery({
    queryKey: ['triggerTypes', integration, { selectedCredentialId }],
    queryFn: () => paragon.getTriggers(integration, { selectedCredentialId }),
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
