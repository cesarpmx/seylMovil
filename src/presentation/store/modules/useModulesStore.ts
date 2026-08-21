import {create} from 'zustand';
import {Modules} from '../../../domain/entities/modules';
import {AuthStatus} from '../../../infrastructure/interfaces/auth.status';
import {authLogin} from '../../../actions/auth/auth';
import {StorageAdapter} from '../../../config/adapters/storage-adapter';
import {clearAccessToken} from '../../../config/api/oauthToken';
import { Empresas } from '../../../domain/entities/empresas';
import { Almacenes } from '../../../domain/entities/almacenes';

export interface ModulesState {
  status: AuthStatus;
  usuid?: string;
  usumail?: string;
  usunombre?: string;
  modules?: Modules[];
  empresas?: Empresas[];
  almacenes?: Almacenes[];

  login: (nombre: string, clave: string) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

// Duración máxima de la sesión: 8 horas (en milisegundos).
export const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

// Verifica si el timestamp de login sigue dentro de las 8 horas.
// Devuelve true si sigue vigente, false si ya expiró.
export const isSessionValid = (loginTimestamp: number | string | null) => {
  if (!loginTimestamp) return false;
  const ts =
    typeof loginTimestamp === 'string'
      ? parseInt(loginTimestamp, 10)
      : loginTimestamp;
  if (isNaN(ts)) return false;
  return Date.now() - ts <= SESSION_TIMEOUT;
};

export const useAuthStore = create<ModulesState>()((set, get) => ({
  status: 'checking',
  usuid: undefined,
  usumail: undefined,
  usunombre: undefined,
  modules: undefined,
  empresas: undefined ,
  almacenes: undefined ,

  login: async (nombre: string, clave: string) => {
    const resp = await authLogin(nombre, clave);

    if (!resp) {
      set({status: 'unauthenticated', modules: undefined, empresas: undefined, almacenes: undefined});
      return false;
    }

    // TODO Save Modules in storage
    const loginTimestamp = Date.now();
    await StorageAdapter.setItem('token', resp.usuid);
    await StorageAdapter.setItem('usunombre', resp.usunombre);
    await StorageAdapter.setItem('modules', JSON.stringify(resp.modules));
    await StorageAdapter.setItem('empresas', JSON.stringify(resp.empresas));
    await StorageAdapter.setItem('almacenes', JSON.stringify(resp.almacenes));
    await StorageAdapter.setItem('loginTimestamp', loginTimestamp.toString());

    set({
      status: 'authenticated',
      usuid: resp.usuid,
      usumail: resp.usumail,
      usunombre: resp.usunombre,
      modules: resp.modules,
      empresas:  resp.empresas,
      almacenes:  resp.almacenes,
    });
    return true;
  },

  checkAuthStatus: async () => {
    
    const token = await StorageAdapter.getItem('token');
    const usuNombre = await StorageAdapter.getItem('usunombre');
    const cachedModules = await StorageAdapter.getItem('modules');
    const cachedEmpresas = await StorageAdapter.getItem('empresas');
    const cachedAlmacenes = await StorageAdapter.getItem('almacenes');
    const loginTimestamp = await StorageAdapter.getItem('loginTimestamp');

    if (token && loginTimestamp) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - parseInt(loginTimestamp, 10);

      // Si ha pasado más de 8 horas, forzamos la desconexión.
      if (timeElapsed > SESSION_TIMEOUT) {
        await get().logout();
        return;
      }

      set({
        status: 'authenticated',
        usuid: token,
        usunombre: usuNombre || "",
        modules: cachedModules ? JSON.parse(cachedModules) : undefined,
        empresas: cachedEmpresas ? JSON.parse(cachedEmpresas) : undefined,
        almacenes: cachedAlmacenes ? JSON.parse(cachedAlmacenes) : undefined,
      });
    } else {
      set({status: 'unauthenticated'});
    }
  },

  logout: async () => {
    // Limpia también el token OAuth cacheado en memoria para que
    // el siguiente login pida uno nuevo a Oracle.
    clearAccessToken();

    await StorageAdapter.removeItem('token');
    await StorageAdapter.removeItem('usunombre');
    await StorageAdapter.removeItem('modules');
    await StorageAdapter.removeItem('empresas');
    await StorageAdapter.removeItem('almacenes');
    // Importante: limpiar el timestamp para que el guard de sesión de
    // 8h en loginApi no bloquee el próximo intento de login.
    await StorageAdapter.removeItem('loginTimestamp');

    set({
      status: 'unauthenticated',
      usuid: undefined,
      usunombre: undefined,
      modules: [],
      empresas: [],
      almacenes: [],
    });
  },
}));