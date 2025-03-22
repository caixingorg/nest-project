export interface JwtPayload {
  sub: string; // User ID
  username: string;
  roles: string[];
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
