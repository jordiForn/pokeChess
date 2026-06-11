import { UserRole } from './user-role';

export interface AdminUserForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  avatar: string | null;
}

export interface AdminUserUpdateForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  avatar: string | null;
}
