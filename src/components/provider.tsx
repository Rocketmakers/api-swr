'use client';

/*
 * React provider for SWR config & state
 * --------------------------------------
 * Wraps the native SWRConfig provider, see here: https://swr.vercel.app/docs/advanced/cache
 */
import * as React from 'react';
import { SWRConfig } from 'swr';

export const ApiSwrProvider: React.FC<React.ComponentProps<typeof SWRConfig>> = ({ children, value }) => {
  return <SWRConfig value={{ provider: () => new Map(), ...value }}>{children}</SWRConfig>;
};
