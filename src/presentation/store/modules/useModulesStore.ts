import {create} from 'zustand';
import {Modules} from '../../../domain/entities/modules';
import {AuthStatus} from '../../../infrastructure/interfaces/auth.status';
import {authLogin} from '../../../actions/auth/auth';
import {StorageAdapter} from '../../../config/adapters/storage-adapter';
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

const SESSION_TIMEOUT = 30 * 60 * 1000;

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

      // Si ha pasado más de 30 minutos, forzamos la desconexión
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
    await StorageAdapter.removeItem('token');
    await StorageAdapter.removeItem('usunombre');
    await StorageAdapter.removeItem('modules');
    await StorageAdapter.removeItem('empresas');
    await StorageAdapter.removeItem('almacenes');
    
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