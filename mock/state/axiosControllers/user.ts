import * as React from 'react';
import { useSWRConfig } from 'swr';
import { AxiosUsers } from '../../api/axioApiClient.ts';
import { axiosApiFactory } from '../axiosControllerFactory.ts';
import { MemoryServer } from '../../servers/memory.ts';
import { useRequestDelay } from '../useRequestDelay.ts';

export const userApi = axiosApiFactory.createAxiosOpenApiController('user', AxiosUsers);

export const useGetUsers = () => {
  const { requestDelay } = useRequestDelay();
  return userApi.getUserList.useQuery({ params: { requestDelay } });
};

export const useGetUsersPaged = (pageSize: number, page: number) => {
  const { requestDelay } = useRequestDelay();
  return userApi.getUserList.useQuery({
    cacheKey: ['pageSize', 'page'],
    params: { pageSize, page, requestDelay },
    swrConfig: { keepPreviousData: true },
  });
};

export const useGetUsersInfinite = (pageSize: number) => {
  const { requestDelay } = useRequestDelay();
  const {
    data,
    size: page,
    setSize: setPage,
    ...hookResponse
  } = userApi.getUserList.useInfiniteQuery({
    cacheKey: 'pageSize',
    params: (pageIndex) => ({ pageSize, page: pageIndex + 1, requestDelay }),
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
  const { requestDelay } = useRequestDelay();
  return userApi.getUser.useQuery({
    cacheKey: 'id',
    params: { id, requestDelay },
  });
};

export const useCreateUser = () => {
  const { requestDelay } = useRequestDelay();
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.addUser.useMutation({ params: { requestDelay } });

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
  const { requestDelay } = useRequestDelay();
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.updateUser.useMutation({ params: { requestDelay } });

  const updateUser = React.useCallback(
    async (id: string, user: Partial<Omit<MemoryServer.IUser, 'id'>>) => {
      const response = await clientFetch({ id, data: user });
      if (response) {
        await invalidate(userApi.getUserList.cacheKey());
        await invalidate(userApi.getUser.cacheKey(response.data.id));
      }
      return response;
    },
    [clientFetch]
  );

  return { updateUser, ...rest };
};

export const useDeleteUser = () => {
  const { requestDelay } = useRequestDelay();
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.deleteUser.useMutation({ params: { requestDelay } });

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
