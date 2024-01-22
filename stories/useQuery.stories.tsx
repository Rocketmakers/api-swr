import * as React from 'react';
import { Button } from '@rocketmakers/armstrong';
import { createMeta } from '../_test/storybook/utils';
import { useGetUsers } from '../mock/state/controllers/user';

export const Default = () => {
  const { data, isLoading, isValidating, mutate: invalidate } = useGetUsers();

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
        {!!data?.length && (
          <tbody>
            {data.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button pending={isLoading || isValidating} onClick={() => invalidate()}>
        Refetch
      </Button>
    </div>
  );
};

export default createMeta(Default, 'Hooks', 'useQuery', {}, true);
