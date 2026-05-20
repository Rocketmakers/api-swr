'use client';

/*
 * React provider for SWR config & state
 * --------------------------------------
 * Wraps the native SWRConfig provider, see here: https://swr.vercel.app/docs/advanced/cache
 */
import * as React from 'react';
import { SWRConfig } from 'swr';

export const ApiSwrProvider = ({ children, value }: React.ComponentProps<typeof SWRConfig>) => {
  return <SWRConfig value={{ provider: () => new Map(), ...value }}>{children}</SWRConfig>;
};
