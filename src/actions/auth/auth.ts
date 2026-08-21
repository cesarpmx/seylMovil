import {loginApi} from '../../config/api/loginApi';
import type { AuthResponse } from '../../infrastructure/interfaces/auth.responses';
import { Empresa } from '../../infrastructure/interfaces/auth.responses';

const returnUserModules = (data: AuthResponse) => {

  const modules = data.items.map(item => ({
      umomodid: item.umomodid,
      modnombre: item.modnombre,
      modcontexto: item.modcontexto,
      umoacceso: item.umoacceso,
      modorden: item.modorden,
      modpadre: item.modpadre,
      modicono: item.modicono,
      modulos: item.modulos ?? [], // Si hay submódulos, los incluimos
      subModulos: item.subModulos ?? []
  }));

  return {
      usuid: data.usuid,
      usumail: data.usumail,
      usunombre: data.usunombre,
      modules,
      empresas: data.empresas,
      almacenes: data.almacenes
  };
};

export const authLogin = async (nombre: string, clave: string) => {
  try {
    const { data } = await loginApi.post<AuthResponse>('/usuarios/loginwms/?', {
      nombre,
      clave,
    });

    const result = returnUserModules(data);

    console.log(data)

    return result;

  } catch (error: any) {
    // Log detallado para diagnosticar en Metro qué falló exactamente.
    if (error?.isAxiosError) {
      console.error('[authLogin] Axios error →', {
        message: error.message,
        code: error.code,
        url: error.config?.baseURL
          ? `${error.config.baseURL}${error.config.url ?? ''}`
          : error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error('[authLogin] error →', error);
    }
    return null;
  }
};
