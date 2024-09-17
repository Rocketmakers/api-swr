import { MemoryServer } from '../servers/memory';
import { AddTestArgs, IPagedRequest, processTestArgs } from './utils';

export const genericUsers = {
  // gets a list of all the users in the system
  getUserList: async (args: IPagedRequest, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.getUsers(args.pageSize, args.page);
  },

  // gets a single user by ID.
  getUser: async (args: { id: string }, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.getUser(args.id);
  },

  // creates a new user
  addUser: async (args: { data: Omit<MemoryServer.IUser, 'id'> }, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.addUser(args.data);
  },

  // updates an existing user's data by ID.
  updateUser: async (args: { id: string; data: Partial<Omit<MemoryServer.IUser, 'id'>> }, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.updateUser(args.id, args.data);
  },

  // removes a user from the system by ID.
  deleteUser: async (args: { id: string }, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.deleteUser(args.id);
  },

  // receives a query string, and returns a list of matching users.
  searchUser: async (args: { search: string }, config?: AddTestArgs) => {
    await processTestArgs(config);
    return MemoryServer.searchUsers(args.search);
  },
};
