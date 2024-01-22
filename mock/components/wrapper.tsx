import * as React from 'react';
import { ApiSwrProvider } from '../../src';

export const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ApiSwrProvider>{children}</ApiSwrProvider>;
};
