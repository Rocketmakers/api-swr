import * as React from 'react';
import { Button } from '@rocketmakers/armstrong';
import { createMeta } from '../_test/storybook/utils';
import { useGetUsersInfinite as axiosQuery } from '../mock/state/axiosControllers/user';
import { useGetUsersInfinite as genericQuery } from '../mock/state/genericControllers/user';

const pageSize = 5;

export const AxiosController = () => {
  const { data, setPage, page, totalPages } = axiosQuery(pageSize);

  return (
    <div className="home">
      <h2>User Table</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
          </tr>
        </thead>
        {!!data.data?.length && (
          <tbody>
            {data.data?.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button onClick={() => setPage((s) => s + 1)} disabled={page === totalPages}>
        Load more
      </Button>
      <div>Current page: {page}</div>
    </div>
  );
};

export const GenericController = () => {
  const { data, setPage, page, totalPages } = genericQuery(pageSize);

  return (
    <div className="home">
      <h2>User Table</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
          </tr>
        </thead>
        {!!data.data?.length && (
          <tbody>
            {data.data?.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button onClick={() => setPage((s) => s + 1)} disabled={page === totalPages}>
        Load more
      </Button>
      <div>Current page: {page}</div>
    </div>
  );
};

export default createMeta(AxiosController, 'Hooks', 'useInfiniteQuery', {}, true);
