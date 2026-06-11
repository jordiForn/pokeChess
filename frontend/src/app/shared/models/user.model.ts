import { UserRole } from './user-role';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}
