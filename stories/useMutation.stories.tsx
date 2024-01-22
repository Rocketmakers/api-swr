import * as React from 'react';
import { Button, Input, useForm } from '@rocketmakers/armstrong';
import { MemoryServer } from '../mock/servers/memory';
import { createMeta } from '../_test/storybook/utils';
import { useGetUser, useUpdateUser } from '../mock/state/controllers/user';

const testUser = MemoryServer.getUsers()[0].id;

export const Default = () => {
  const { data } = useGetUser(testUser);
  const { updateUser, isLoading } = useUpdateUser();

  const { formProp, formState } = useForm<MemoryServer.IUser>(
    data ?? {
      id: testUser,
      email: '',
      firstName: '',
      lastName: '',
    }
  );

  return (
    <div className="home">
      <Input type="text" bind={formProp('firstName').bind()} />
      <Input type="text" bind={formProp('lastName').bind()} />
      <Input type="email" bind={formProp('email').bind()} />
      <Button pending={isLoading} onClick={() => updateUser(testUser, { ...formState })}>
        Update
      </Button>
    </div>
  );
};

export default createMeta(Default, 'Hooks', 'useMutation', {}, true);
