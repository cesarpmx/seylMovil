import axios, {AxiosInstance} from 'axios';
import {getAccessToken, clearAccessToken} from './oauthToken';
import {getAuthMode, getBasicConfig, getBearerConfig} from './authMode';
import {StorageAdapter} from '../adapters/storage-adapter';
import {
  isSessionValid,
  useAuthStore,
} from '../../presentation/store/modules/useModulesStore';

// Rutas que no deben validar el timer de sesión (el propio login).
const isLoginRequest = (url?: string) =>
  !!url && url.includes('/usuarios/loginwms');

// Guard: verifica que la sesión de 8h siga vigente antes de cada request.
// Si expiró, cierra sesión y aborta la petición con un error claro.
const ensureSessionAlive = async (url?: string) => {
  // La propia petición de login jamás debe ser bloqueada por el guard.
  if (isLoginRequest(url)) return;
  const ts = await StorageAdapter.getItem('loginTimestamp');
  if (!ts) return;
  if (!isSessionValid(ts)) {
    console.warn('[loginApi] Sesión expirada (8h). Cerrando sesión.');
    await useAuthStore.getState().logout();
    throw new axios.Cancel('Sesión expirada. Vuelve a iniciar sesión.');
  }
};

// === BASIC AUTH ===
const basicAuthApi = axios.create({
  headers: {'Content-Type': 'application/json'},
});

basicAuthApi.interceptors.request.use(async config => {
  await ensureSessionAlive(config.url);
  const {apiUrl, username, password} = getBasicConfig();
  config.baseURL = apiUrl;
  config.auth = {username, password};
  return config;
});

// === BEARER TOKEN ===
const bearerAuthApi = axios.create({
  headers: {'Content-Type': 'application/json'},
});

bearerAuthApi.interceptors.request.use(async config => {
  await ensureSessionAlive(config.url);
  const {apiHostUrl} = getBearerConfig();
  config.baseURL = apiHostUrl;
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

bearerAuthApi.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      clearAccessToken();
      const token = await getAccessToken(true);
      original.headers.Authorization = `Bearer ${token}`;
      return axios(original);
    }
    return Promise.reject(error);
  },
);

const resolveApi = (): AxiosInstance =>
  getAuthMode() === 'bearer' ? bearerAuthApi : basicAuthApi;

// Proxy: cada request elige en runtime la instancia correcta según el modo actual.
const loginApi = new Proxy({} as AxiosInstance, {
  get: (_target, prop: keyof AxiosInstance) => {
    const target = resolveApi();
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export {loginApi};
