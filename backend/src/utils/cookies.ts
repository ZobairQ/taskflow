/**
 * Cookie Utilities
 * Helper functions for setting and clearing authentication cookies
 */

import { Response } from 'express';
import { AUTH_CONFIG } from '../config/constants';

/**
 * Set authentication cookies on the response
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const { COOKIE, COOKIE_NAMES } = AUTH_CONFIG;

  // Set access token cookie (short-lived)
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: COOKIE.HTTP_ONLY,
    secure: COOKIE.SECURE,
    sameSite: COOKIE.SAME_SITE,
    maxAge: COOKIE.ACCESS_TOKEN_MAX_AGE,
    path: '/',
  });

  // Set refresh token cookie (long-lived)
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: COOKIE.HTTP_ONLY,
    secure: COOKIE.SECURE,
    sameSite: COOKIE.SAME_SITE,
    maxAge: COOKIE.REFRESH_TOKEN_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear authentication cookies from the response
 */
export function clearAuthCookies(res: Response): void {
  const { COOKIE_NAMES } = AUTH_CONFIG;

  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

/**
 * Get tokens from cookies or Authorization header
 * Falls back to header if cookies not present (for backward compatibility)
 */
export function getTokensFromRequest(req: {
  cookies?: Record<string, string>;
  headers?: { authorization?: string };
}): { accessToken: string | null; refreshToken: string | null } {
  const { COOKIE_NAMES } = AUTH_CONFIG;

  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  // Try cookies first
  if (req.cookies) {
    accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN] || null;
    refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] || null;
  }

  // Fall back to Authorization header for access token
  if (!accessToken && req.headers?.authorization) {
    const authHeader = req.headers.authorization;
    accessToken = authHeader.replace('Bearer ', '');
  }

  return { accessToken, refreshToken };
}
