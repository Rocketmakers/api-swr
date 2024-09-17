import * as React from 'react';
import { Button } from '@rocketmakers/armstrong';
import { createMeta } from '../_test/storybook/utils';
import { useGetUsersPaged as axiosQuery } from '../mock/state/axiosControllers/user';
import { useGetUsersPaged as genericQuery } from '../mock/state/genericControllers/user';

export const AxiosController = () => {
  const [page, setPage] = React.useState(1);
  const { data } = axiosQuery(5, page);

  const totalPages = Math.ceil((data?.total ?? 0) / 5);

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
        {!!data?.data.length && (
          <tbody>
            {data?.data.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button onClick={() => setPage((s) => s - 1)} disabled={page === 1}>
        Prev
      </Button>
      <div>Current page: {page}</div>
      <Button onClick={() => setPage((s) => s + 1)} disabled={page === totalPages}>
        Next
      </Button>
    </div>
  );
};

export const GenericController = () => {
  const [page, setPage] = React.useState(1);
  const { data } = genericQuery(5, page);

  const totalPages = Math.ceil((data?.total ?? 0) / 5);

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
        {!!data?.data.length && (
          <tbody>
            {data?.data.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button onClick={() => setPage((s) => s - 1)} disabled={page === 1}>
        Prev
      </Button>
      <div>Current page: {page}</div>
      <Button onClick={() => setPage((s) => s + 1)} disabled={page === totalPages}>
        Next
      </Button>
    </div>
  );
};

export default createMeta(AxiosController, 'Hooks', 'usePagedQuery', {}, true);
