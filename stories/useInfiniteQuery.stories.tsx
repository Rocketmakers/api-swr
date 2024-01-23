import * as React from 'react';
import { Button } from '@rocketmakers/armstrong';
import { createMeta } from '../_test/storybook/utils';
import { useGetUsersInfinite } from '../mock/state/controllers/user';

const pageSize = 5;

export const Default = () => {
  const { data, setPage, page, totalPages } = useGetUsersInfinite(pageSize);

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

export default createMeta(Default, 'Hooks', 'useInfiniteQuery', {}, true);
