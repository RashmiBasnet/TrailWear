export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string | null;
  googleId: string | null;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'password' | 'googleId' | 'updatedAt'>;
