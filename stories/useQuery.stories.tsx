import * as React from 'react';
import { Button } from '@rocketmakers/armstrong';
import { createMeta } from '../_test/storybook/utils';
import { useGetUsers as axiosQuery } from '../mock/state/axiosControllers/user';
import { useGetUsers as genericQuery } from '../mock/state/genericControllers/user';

export const AxiosController = () => {
  const { data, isLoading, isValidating, mutate: invalidate } = axiosQuery();

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
      <Button pending={isLoading || isValidating} onClick={() => invalidate()}>
        Refetch
      </Button>
    </div>
  );
};

export const GenericController = () => {
  const { data, isLoading, isValidating, mutate: invalidate } = genericQuery();

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
      <Button pending={isLoading || isValidating} onClick={() => invalidate()}>
        Refetch
      </Button>
    </div>
  );
};

export default createMeta(AxiosController, 'Hooks', 'useQuery', {}, true);
