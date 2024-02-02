# Custom API Client

API SWR currently exports a single controller factory that is designed to work with a generated TypeScript API client. Watch this space though because there is the possibility of other controller factories coming soon!

It's still entirely possible to use API SWR with a hand written API client, you just need to follow these rules:

- Write a TypeScript class for each API tag (or backend controller.)
- Write a constructor for the class that receives the `fetchConfig` and `basePath`.
- Write a public class method for each endpoint which calls `axios` and returns a `Promise` with some data.
- Ensure that each endpoint method receives a **single object** containing the endpoint arguments.

Here's an example of a very simple "User" controller which would be compatible with API SWR:

```TypeScript
import type { AxiosResponse } from 'axios';

export class User {

  constructor(
    public fetchConfig: object,
    public basePath: string
  ) {}

  // gets a list of all the users in the system
  getUserList(): Promise<AxiosResponse<IUser[]>> {
    return axios.get(`${this.basePath}/user`, this.fetchConfig);
  }

  // gets a single user by ID.
  getUser(args: { id: string }): Promise<AxiosResponse<IUser>> {
    return axios.get(`${this.basePath}/user/${args.id}`, this.fetchConfig);
  }

  // creates a new user
  addUser(args: IUserCreate): Promise<AxiosResponse<IUser>> {
    return axios.post(`${this.basePath}/user`, args, this.fetchConfig);
  }

  // updates an existing user's data by ID.
  updateUser(args: IUser): Promise<AxiosResponse<IUser>> {
    return axios.put(`${this.basePath}/user/${args.id}`, args, this.fetchConfig);
  }

  // removes a user from the system by ID.
  deleteUser(args: { id: string }): Promise<AxiosResponse<void>> {
    return axios.delete(`${this.basePath}/user/${args.id}`, this.fetchConfig);
  }
}
```

This `User` controller can then be passed to an API SWR controller in the following way:

```TypeScript
import { apiFactory } from "../controllerFactory.ts"
import { User } from "../../api/client.ts";

export const userApi = apiFactory.createAxiosOpenApiController("user", User);
```
