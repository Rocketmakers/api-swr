import React from 'react';

import '../../mock/theme/theme.scss';
import { Wrapper } from '../../mock/components/wrapper';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <Wrapper>
      <Story />
    </Wrapper>
  ),
];
