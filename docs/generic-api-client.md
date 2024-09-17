# Generic API Client

API SWR now supports generic API clients which are not tied to OpenAPI or Axios. Such clients can be used to interface with any asynchronous data fetching library (e.g. fetch, Firebase, Supabase, GQL, IndexDB)

The structure of your generic API clients will need to follow these rules:

- Write a TypeScript object for each API tag (or backend controller.)
- Write a key on the object for each endpoint which returns a `Promise` with some data.
- Ensure that each endpoint method receives a **single object** containing the endpoint parameters as arg 1.
- Optionally, a custom config object can be used which will be passed to each endpoint as arg 2.

Here's an example of a very simple "User" controller which would be compatible with API SWR:

- This example uses the `fetch` library to make some very simple API calls.
- The base path of the API is passed in using the `config` parameter of the API controller

```TypeScript

export const user = {
  // gets a list of all the users in the system
  getUserList(args: { page: number }, config: { basePath: string }): Promise<IUser[]> {
    return fetch(`${config.basePath}/user?page=${args.page}`);
  },

  // gets a single user by ID.
  getUser(args: { id: string }, config: { basePath: string }): Promise<IUser> {
    return fetch(`${config.basePath}/user/${args.id}`);
  },

  // creates a new user
  addUser(args: IUserCreate, config: { basePath: string }): Promise<IUser> {
    return fetch(`${config.basePath}/user`, { method: 'POST', body: args });
  },

  // updates an existing user's data by ID.
  updateUser(args: IUser, config: { basePath: string }): Promise<IUser> {
    return fetch(`${config.basePath}/user/${args.id}`, { method: 'PUT', body: args });
  },

  // removes a user from the system by ID.
  deleteUser(args: { id: string }, config: { basePath: string }): Promise<void> {
    return fetch(`${config.basePath}/user/${args.id}`, { method: 'DELETE' });
  },
}
```

This `user` controller can then be passed to a generic API SWR controller in the following way:

```TypeScript
import { apiFactory } from "../controllerFactory.ts"
import { user } from "../../api/client.ts";

export const userApi = apiFactory.createGenericApiController("user", user, { basePath: 'https://my.cool.api' });
```
