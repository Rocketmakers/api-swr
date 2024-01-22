import { MemoryServer } from '../servers/memory';

type AddTestArgs<TArgs = object> = TArgs & {
  requestDelay?: number;
  throwServerError?: boolean;
};

async function processTestArgs<TArgs = object>(args: AddTestArgs<TArgs>) {
  if (args.requestDelay) {
    await new Promise((r) => {
      setTimeout(r, args.requestDelay);
    });
  }
  if (args.throwServerError) {
    throw new Error('An unexpected error occurred');
  }
}

export class Users {
  constructor(
    public fetchConfig: object,
    public basePath: string
    // eslint-disable-next-line no-empty-function
  ) {}

  // gets a list of all the users in the system
  async getUserList(args: AddTestArgs) {
    await processTestArgs(args);
    return MemoryServer.getUsers();
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
