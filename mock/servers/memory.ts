import { UUIDService } from '../services/uuid';
import userData from '../data/users.json';

export namespace MemoryServer {
  export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

  export interface IPagedResponse<T> {
    data: T[];
    total: number;
  }

  let users: IUser[] = [...userData];

  export function getUsers(pageSize?: number, page?: number): IPagedResponse<IUser> {
    let data = [...users];
    if (pageSize && page) {
      data = [...users].slice((page - 1) * pageSize, page * pageSize);
    }
    return { data, total: users.length };
  }

  export function getUser(id: string): IUser {
    const user = users.filter((u) => u.id === id);
    if (user.length === 1) {
      return user[0];
    }
    throw new Error(`User not found with ID ${id}`);
  }

  export function searchUsers(search: string): IUser[] {
    const regex = new RegExp(search, 'gi');
    return users.filter((u) => regex.test(u.firstName) || regex.test(u.lastName) || regex.test(u.email));
  }

  export function deleteUser(id: string): void {
    const user = getUser(id);
    users = [...users.filter((u) => u.id !== user.id)];
  }

  export function updateUser(id: string, data: Partial<Omit<IUser, 'id'>>): IUser {
    let user = getUser(id);
    user = { ...user, ...data };
    users = users.map((u) => (u.id === id ? user : u));
    return user;
  }

  export function addUser(data: Omit<IUser, 'id'>): IUser {
    const newUser = { id: UUIDService.create(), ...data };
    users.push(newUser);
    return newUser;
  }
}
