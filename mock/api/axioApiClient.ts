import { MemoryServer } from '../servers/memory';
import { AddTestArgs, IPagedRequest, processTestArgs } from './utils';

export class AxiosUsers {
  constructor(
    public fetchConfig: object,
    public basePath: string
    // eslint-disable-next-line no-empty-function
  ) {}

  // gets a list of all the users in the system
  async getUserList(args: AddTestArgs<IPagedRequest>) {
    await processTestArgs(args);
    return MemoryServer.getUsers(args.pageSize, args.page);
  }

  // gets a single user by ID.
  async getUser(args: AddTestArgs<{ id: string }>) {
    await processTestArgs(args);
    return MemoryServer.getUser(args.id);
  }

  // creates a new user
  async addUser(args: AddTestArgs<{ data: Omit<MemoryServer.IUser, 'id'> }>) {
    await processTestArgs(args);
    return MemoryServer.addUser(args.data);
  }

  // updates an existing user's data by ID.
  async updateUser(args: AddTestArgs<{ id: string; data: Partial<Omit<MemoryServer.IUser, 'id'>> }>) {
    await processTestArgs(args);
    return MemoryServer.updateUser(args.id, args.data);
  }

  // removes a user from the system by ID.
  async deleteUser(args: AddTestArgs<{ id: string }>) {
    await processTestArgs(args);
    return MemoryServer.deleteUser(args.id);
  }

  // receives a query string, and returns a list of matching users.
  async searchUser(args: AddTestArgs<{ search: string }>) {
    await processTestArgs(args);
    return MemoryServer.searchUsers(args.search);
  }
}
