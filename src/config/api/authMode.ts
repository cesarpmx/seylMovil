import {StorageAdapter} from '../adapters/storage-adapter';

export type AuthMode = 'basic' | 'bearer';

export interface BasicAuthConfig {
  apiUrl: string;
  username: string;
  password: string;
}

export interface BearerAuthConfig {
  oauthTokenUrl: string;
  apiHostUrl: string;
  clientId: string;
  clientSecret: string;
}

const KEY_MODE = 'authMode';
const KEY_BASIC = 'authConfig.basic';
const KEY_BEARER = 'authConfig.bearer';

// Default = 'bearer' para que la app arranque lista para Oracle Cloud
// sin que el usuario tenga que entrar a Configuración primero.
// Solo se cambia a 'basic' si el usuario lo guardó explícitamente.
const normalizeMode = (value: string | null | undefined): AuthMode =>
  value === 'basic' ? 'basic' : 'bearer';

const emptyBasic = (): BasicAuthConfig => ({
  apiUrl: '',
  username: '',
  password: '',
});

// Valores por default hardcodeados para bearer (Oracle concir02).
// Cuando pases a multitenant, vacía estos strings.
const emptyBearer = (): BearerAuthConfig => ({
  oauthTokenUrl:
    'https://g03e57b4585e659-concir02.adb.mx-queretaro-1.oraclecloudapps.com/ords/load_cl/oauth/token',
  apiHostUrl:
    'https://g03e57b4585e659-concir02.adb.mx-queretaro-1.oraclecloudapps.com/ords/load_cl',
  clientId: 'LN91702Yk97fkkDitlZKLw..',
  clientSecret: '6u0T5KRm3H01EP8XbvzBYw..',
});

let currentMode: AuthMode = 'bearer';
let currentBasic: BasicAuthConfig = emptyBasic();
let currentBearer: BearerAuthConfig = emptyBearer();

const mergeBasic = (raw: string | null): BasicAuthConfig => {
  if (!raw) return emptyBasic();
  try {
    return {...emptyBasic(), ...JSON.parse(raw)};
  } catch {
    return emptyBasic();
  }
};

const mergeBearer = (raw: string | null): BearerAuthConfig => {
  if (!raw) return emptyBearer();
  try {
    return {...emptyBearer(), ...JSON.parse(raw)};
  } catch {
    return emptyBearer();
  }
};

export const initAuthConfig = async (): Promise<void> => {
  const [storedMode, storedBasic, storedBearer] = await Promise.all([
    StorageAdapter.getItem(KEY_MODE),
    StorageAdapter.getItem(KEY_BASIC),
    StorageAdapter.getItem(KEY_BEARER),
  ]);
  currentMode = normalizeMode(storedMode);
  currentBasic = mergeBasic(storedBasic);
  currentBearer = mergeBearer(storedBearer);
};

export const getAuthMode = (): AuthMode => currentMode;
export const getBasicConfig = (): BasicAuthConfig => currentBasic;
export const getBearerConfig = (): BearerAuthConfig => currentBearer;

export const setAuthMode = async (mode: AuthMode): Promise<void> => {
  currentMode = normalizeMode(mode);
  await StorageAdapter.setItem(KEY_MODE, currentMode);
};

export const setBasicConfig = async (
  partial: Partial<BasicAuthConfig>,
): Promise<BasicAuthConfig> => {
  currentBasic = {...currentBasic, ...partial};
  await StorageAdapter.setItem(KEY_BASIC, JSON.stringify(currentBasic));
  return currentBasic;
};

export const setBearerConfig = async (
  partial: Partial<BearerAuthConfig>,
): Promise<BearerAuthConfig> => {
  currentBearer = {...currentBearer, ...partial};
  await StorageAdapter.setItem(KEY_BEARER, JSON.stringify(currentBearer));
  return currentBearer;
};

export const clearBasicConfig = async (): Promise<void> => {
  currentBasic = emptyBasic();
  await StorageAdapter.removeItem(KEY_BASIC);
};

export const clearBearerConfig = async (): Promise<void> => {
  currentBearer = emptyBearer();
  await StorageAdapter.removeItem(KEY_BEARER);
};
