import { paragon } from '@useparagon/connect';

const DEFAULT_PAGE_SIZE = 10;

function parseOffset(cursor: string | null | undefined): number {
  return cursor ? parseInt(cursor, 10) : 0;
}

function toProductOptions(products: { title: string; id: number }[]) {
  return products.map((p) => ({
    label: p.title,
    value: String(p.id),
  }));
}

function nextPageCursor(
  offset: number,
  limit: number,
  total: number,
): string | null {
  return offset + limit < total ? String(offset + limit) : null;
}

function filterBySearch<T extends { label: string }>(
  items: T[],
  search: string | null | undefined,
): T[] {
  if (!search) return items;
  const lower = search.toLowerCase();
  return items.filter((item) => item.label.toLowerCase().includes(lower));
}

export function setupMockDataSources() {
  // paragon.setDataSources({
  //   dropdowns: {
  //     'custom-dropdown': {
  //       loadOptions: async (cursor, search) => {
  //         const offset = parseOffset(cursor);
  //         const query = search ?? '';
  //         const res = await fetch(
  //           `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${DEFAULT_PAGE_SIZE}&skip=${offset}`,
  //         );
  //         const data = await res.json();
  //         return {
  //           options: toProductOptions(data.products),
  //           nextPageCursor: nextPageCursor(offset, DEFAULT_PAGE_SIZE, data.total),
  //         };
  //       },
  //     },
  //   },
  // });

  paragon.setDataSources({
    mapObjectFields: {
      Task: {
        objectTypes: {
          get: async (cursor, search) => {
            const offset = parseOffset(cursor);
            const res = await fetch(
              'https://dummyjson.com/products/categories',
            );
            const data: { slug: string; name: string }[] = await res.json();
            const all = data.map((c) => ({
              label: c.name,
              value: c.slug,
            }));
            const filtered = filterBySearch(all, search);
            const page = filtered.slice(offset, offset + DEFAULT_PAGE_SIZE);
            return {
              options: page,
              nextPageCursor: nextPageCursor(
                offset,
                DEFAULT_PAGE_SIZE,
                filtered.length,
              ),
            };
          },
        },
        integrationFields: {
          get: async ({ objectType }, cursor) => {
            const offset = parseOffset(cursor);
            const res = await fetch(
              `https://dummyjson.com/products/category/${objectType}?limit=${DEFAULT_PAGE_SIZE}&skip=${offset}`,
            );
            const data = await res.json();
            return {
              options: toProductOptions(data.products),
              nextPageCursor: nextPageCursor(
                offset,
                DEFAULT_PAGE_SIZE,
                data.total,
              ),
            };
          },
        },
        applicationFields: {
          fields: [
            { label: 'Title', value: 'title' },
            { label: 'Price', value: 'price' },
            { label: 'Brand', value: 'brand' },
          ],
          defaultFields: [],
          userCanRemoveMappings: true,
        },
      },
    },
  });
}
