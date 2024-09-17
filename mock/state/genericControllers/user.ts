import * as React from 'react';
import { useSWRConfig } from 'swr';
import { MemoryServer } from '../../servers/memory.ts';
import { genericApiFactory } from '../genericControllerFactory.ts';
import { genericUsers } from '../../api/genericApiClient.ts';

export const userApi = genericApiFactory.createGenericApiController('users', genericUsers);

export const useGetUsers = () => {
  return userApi.getUserList.useQuery();
};

export const useGetUsersPaged = (pageSize: number, page: number) => {
  return userApi.getUserList.useQuery({
    cacheKey: ['pageSize', 'page'],
    params: { pageSize, page },
    swrConfig: { keepPreviousData: true },
  });
};

export const useGetUsersInfinite = (pageSize: number) => {
  const {
    data,
    size: page,
    setSize: setPage,
    ...hookResponse
  } = userApi.getUserList.useInfiniteQuery({
    cacheKey: 'pageSize',
    params: (pageIndex) => ({ pageSize, page: pageIndex + 1 }),
    fetchConfig: { requestDelay: 100 },
  });

  const parsedData = React.useMemo(() => {
    const users = data?.reduce<MemoryServer.IUser[]>((acc, p) => [...acc, ...(p?.data ?? [])], []);
    const total = data?.[0]?.total ?? 0;
    return { data: users, total };
  }, [data]);

  const totalPages = React.useMemo(() => Math.ceil(parsedData.total / pageSize), [pageSize, parsedData.total]);

  return { ...hookResponse, data: parsedData, totalPages, page, setPage };
};

export const useGetUser = (id: string) => {
  return userApi.getUser.useQuery({
    cacheKey: 'id',
    params: { id },
  });
};

export const useCreateUser = () => {
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.addUser.useMutation();

  const createUser = React.useCallback(
    async (user: MemoryServer.IUser) => {
      const response = await clientFetch({ data: user });
      if (response) {
        await invalidate(userApi.getUserList.cacheKey());
      }
      return response;
    },
    [clientFetch]
  );

  return { createUser, ...rest };
};

export const useUpdateUser = () => {
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.updateUser.useMutation();

  const updateUser = React.useCallback(
    async (id: string, user: Partial<Omit<MemoryServer.IUser, 'id'>>) => {
      const response = await clientFetch({ id, data: user });
      if (response) {
        await invalidate(userApi.getUserList.cacheKey());
        await invalidate(userApi.getUser.cacheKey(response.id));
      }
      return response;
    },
    [clientFetch]
  );

  return { updateUser, ...rest };
};

export const useDeleteUser = () => {
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.deleteUser.useMutation();

  const deleteUser = React.useCallback(
    async (id: string) => {
      const response = await clientFetch({ id });
      if (response) {
        await invalidate(userApi.getUser.cacheKey(id));
        await invalidate(userApi.getUserList.startsWithInvalidator());
      }
      return response;
    },
    [clientFetch]
  );

  return { deleteUser, ...rest };
};
