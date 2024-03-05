# Paging

This section includes examples for integrating with an endpoint that receives paging parameters and returns a subset of data.

## Next / Prev Paging Models

Integrating with next/prev paging models can be achieved with a simple [useQuery](use-query.md). Any paging parameters must be added to the cache key definition, like this:

```TypeScript
// skip/take driven
export const useGetUsers = (pageIndex: number, pageSize: number) => {
  return userApi.getUsers.useQuery({
    cacheKey: ['skip', 'take'],
    params: { skip: pageIndex * pageSize, take: pageSize },
    swrConfig: { keepPreviousData: true },
  });
};

// page number driven
export const useGetUsers = (page: number, pageSize: number) => {
  return userApi.getUsers.useQuery({
    cacheKey: ['page', 'pageSize'],
    params: { page, pageSize },
    swrConfig: { keepPreviousData: true },
  });
};

// cursor driven
export const useGetUsers = (previousCursor: string | undefined, pageSize: number) => {
  return userApi.getUsers.useQuery({
    cacheKey: ['cursor', 'pageSize'],
    params: { cursor: previousCursor, pageSize },
    swrConfig: { keepPreviousData: true },
  });
};
```

Notice the `keepPreviousData` flag has been set to `true` in the SWR config. This is a useful feature that allows the previous page to stay on screen wile the next page is loading.

## Infinite loading models

Infinite loading models are a little more complex and will require use of the [useInfiniteQuery](use-infinte-query.md) hook:

Unlike `useQuery`, `useInfiniteQuery` receives its params as a function which is passed the previous page index and the previous response object. This is to allow for both page number driven and cursor driven paging models:

```TypeScript
// skip/take driven
export const useGetUsersInfinite = (pageSize: number) => {
  return userApi.getUserList.useInfiniteQuery({
    cacheKey: 'take',
    params: (pageIndex) => ({ skip: pageIndex * pageSize, take: pageSize }),
  });
};

// page number driven
export const useGetUsersInfinite = (pageSize: number) => {
  return userApi.getUserList.useInfiniteQuery({
    cacheKey: 'pageSize',
    params: (pageIndex) => ({ pageSize, page: pageIndex + 1 }),
  });
};

// cursor driven
export const useGetUsersInfinite = (pageSize: number) => {
  return userApi.getUserList.useInfiniteQuery({
    cacheKey: 'pageSize',
    params: (_, prevResponse) => ({ pageSize, cursor: prevResponse?.cursor }),
  });
};
```

`useInfiniteQuery` returns a slightly different set of tools when compared to the standard `useQuery`. Let's have a look at the new ones specifically:

```TypeScript
const { data, setSize, size } = useGetUsersInfinite(10);
```

| Property  | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `data`    | The data returned will be **an array of responses** rather than a single response object. |
| `setSize` | Sets the number of pages to be loaded.                                                    |
| `size`    | The number of pages that have currently been loaded.                                      |

## SWR Documentation

For further information on how SWR handles paging under the hood, take a look at their documentation:

- [General pagination](https://swr.vercel.app/docs/pagination)
- [Infinite loading](https://swr.vercel.app/docs/pagination#useswrinfinite)
