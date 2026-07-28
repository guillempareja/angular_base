import type { Token } from '@shared/models/auth.types';

//----------------------------------------------------------------
// API REQUEST / RESPONSE TYPES
//----------------------------------------------------------------

// login
export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  username: string;
  token: Token;
  refreshToken: Token;
};

export type { Token };
