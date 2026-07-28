import type { Token } from '@shared/models/auth.types';

//----------------------------------------------------------------
// API REQUEST / RESPONSE TYPES
//----------------------------------------------------------------

// refreshToken
export type RefreshTokenRequest = {
  refreshToken: Token;
};

export type RefreshTokenResponse = {
  token: Token;
  refreshToken: Token;
};
