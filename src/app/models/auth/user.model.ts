import { Role } from './role.model';

export interface User {
  idUser?: number;
  username: string;
  email: string;
  password?: string;
  ldap: boolean;
  enabled: boolean;
  roles: Role[];
}