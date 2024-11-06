import { createMockAxiosSuccessResponse } from '../../src';
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
    return createMockAxiosSuccessResponse(MemoryServer.getUsers(args.pageSize, args.page), 200);
  }

  // gets a single user by ID.
  async getUser(args: AddTestArgs<{ id: string }>) {
    await processTestArgs(args);
    return createMockAxiosSuccessResponse(MemoryServer.getUser(args.id), 200);
  }

  // creates a new user
  async addUser(args: AddTestArgs<{ data: Omit<MemoryServer.IUser, 'id'> }>) {
    await processTestArgs(args);
    return createMockAxiosSuccessResponse(MemoryServer.addUser(args.data), 200);
  }

  // updates an existing user's data by ID.
  async updateUser(args: AddTestArgs<{ id: string; data: Partial<Omit<MemoryServer.IUser, 'id'>> }>) {
    await processTestArgs(args);
    return createMockAxiosSuccessResponse(MemoryServer.updateUser(args.id, args.data), 200);
  }

  // removes a user from the system by ID.
  async deleteUser(args: AddTestArgs<{ id: string }>) {
    await processTestArgs(args);
    return createMockAxiosSuccessResponse(MemoryServer.deleteUser(args.id), 204);
  }

  // receives a query string, and returns a list of matching users.
  async searchUser(args: AddTestArgs<{ search: string }>) {
    await processTestArgs(args);
    return createMockAxiosSuccessResponse(MemoryServer.searchUsers(args.search), 200);
  }
}
