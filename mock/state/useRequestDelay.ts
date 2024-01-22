import * as React from 'react';

export const useRequestDelay = () => {
  return React.useMemo(() => ({ requestDelay: 1000 }), []);
};
