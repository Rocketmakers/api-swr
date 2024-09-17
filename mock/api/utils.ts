export type AddTestArgs<TArgs = object> = TArgs & {
  requestDelay?: number;
  throwServerError?: boolean;
};

export interface IPagedRequest {
  pageSize?: number;
  page?: number;
}

export async function processTestArgs<TArgs = object>(args?: AddTestArgs<TArgs>) {
  if (args?.requestDelay) {
    await new Promise((r) => {
      setTimeout(r, args.requestDelay);
    });
  }
  if (args?.throwServerError) {
    throw new Error('An unexpected error occurred');
  }
}
