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

  } catch (error) {
    console.error(error);
    return null;
  }
};
