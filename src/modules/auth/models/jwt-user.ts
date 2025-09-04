export type JwtRole = 'USER' | 'ADMIN';
export interface JwtUser {
  sub: number;
  email: string;
  role: JwtRole;
}
