import type { Request as NestRequest } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request as ExpressRequest } from 'express';

export type MfaMethod = 'NONE' | 'SMS' | 'TOTP' | 'EMAIL';

export interface AccessTokenClaims {
  id: number;
  role?: Role;
}

export interface TokenResponse {
  userData?: object;
  accessToken: string;
}

export interface TotpTokenResponse {
  totpToken: string;
  type: MfaMethod;
  multiFactorRequired: true;
}

export interface AccessTokenParsed {
  id: number;
  type: 'user' | 'api-key';
  role?: Role;
}

export interface MfaTokenPayload {
  id: number;
  type: MfaMethod;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface UserRequest extends CombinedRequest {
  user: AccessTokenParsed;
}
