import {getBearerConfig} from './authMode';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let expiresAt = 0;
let inflight: Promise<string> | null = null;

const REFRESH_MARGIN_MS = 60 * 1000;

// btoa polyfill (RN no lo trae en algunas versiones)
const b64 = (s: string): string => {
  if (typeof global.btoa === 'function') return global.btoa(s);
  // Fallback manual
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c1 = s.charCodeAt(i++) & 0xff;
    const c2 = i < s.length ? s.charCodeAt(i++) & 0xff : NaN;
    const c3 = i < s.length ? s.charCodeAt(i++) & 0xff : NaN;
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4);
    const e3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6);
    const e4 = isNaN(c3) ? 64 : c3 & 63;
    out += chars[e1] + chars[e2] + chars[e3] + chars[e4];
  }
  return out;
};

// Usamos fetch nativo de RN (más estable que axios en iOS con Oracle Cloud).
const requestNewToken = async (): Promise<string> => {
  const {oauthTokenUrl, clientId, clientSecret} = getBearerConfig();

  const basic = b64(`${clientId}:${clientSecret}`);

  const res = await fetch(oauthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Token request failed: HTTP ${res.status} ${res.statusText} — ${text}`,
    );
  }

  const data = (await res.json()) as TokenResponse;

  cachedToken = data.access_token;
  expiresAt = Date.now() + data.expires_in * 1000 - REFRESH_MARGIN_MS;
  return cachedToken;
};

export const getAccessToken = async (forceRefresh = false): Promise<string> => {
  if (!forceRefresh && cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }
  if (!inflight) {
    inflight = requestNewToken().finally(() => {
      inflight = null;
    });
  }
  return inflight;
};

export const clearAccessToken = () => {
  cachedToken = null;
  expiresAt = 0;
};
