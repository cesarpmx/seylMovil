import {loginApi} from '../../config/api/loginApi';

export interface EmpresaConfiguracion {
  ecoempid?: number;
  ecohost?: string;
  ecoport?: string;
  ecouser?: string;
  ecopassword?: string;
  empresa?: string;
  [key: string]: any;
}

export const getEmpresaConfiguracion = async (
  idEmpresa: string | number,
): Promise<EmpresaConfiguracion | null> => {
  const url = `/configuracion/empresasconf/?clave=${encodeURIComponent(String(idEmpresa))}`;
  try {
    const {data} = await loginApi.get<any>(url);

    if (!data) return null;

    if (Array.isArray(data.items) && data.items.length > 0) {
      const valido = data.items.find(
        (it: any) => it && (it.ecohost || it.ecouser || it.empresa),
      );
      if (valido) return valido as EmpresaConfiguracion;
      return data.items[0] as EmpresaConfiguracion;
    }
    if (data.success && data.data) return data.data as EmpresaConfiguracion;
    return data as EmpresaConfiguracion;
  } catch (error: any) {
    console.error('[getEmpresaConfiguracion] status:', error?.response?.status);
    console.error('[getEmpresaConfiguracion] body:', JSON.stringify(error?.response?.data));
    console.error('[getEmpresaConfiguracion] message:', error?.message);
    throw error;
  }
};
