import { loginApi } from '../../config/api/loginApi';
import { Dashboard } from '../../domain/entities/dashboard';

interface Params {
  empresa: string | number;
  almacen: string;
  fechafin: string; // dd-MM-yyyy
  diasAtras: string | number;
  estatus?: string;
  cliente?: string;
  tipoDoc?: string;
  serieForm?: string;
  contrato?: string;
  tipocom?: string;
  busqBnd?: string | number;
}

// El backend manda "" en vez de [] cuando no hay datos.
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? v : []);
const asNumber = (v: unknown) => Number(v) || 0;

export const getDashboardVentas = async (params: Params): Promise<Dashboard> => {
  const {
    empresa,
    almacen,
    fechafin,
    diasAtras,
    estatus = '',
    cliente = '',
    tipoDoc = '',
    serieForm = '',
    contrato = '',
    // Fijos igual que el web: sin tipocom/busqBnd el backend responde incompleto.
    tipocom = 'I',
    busqBnd = 15,
  } = params;

  const url =
    `/dashboards/ventas/?empresa=${empresa}` +
    `&almacen=${almacen}` +
    `&fechafin=${fechafin}` +
    `&diasatras=${diasAtras}` +
    `&estatus=${estatus}` +
    `&cliente=${cliente}` +
    `&tipoDoc=${tipoDoc}` +
    `&serieForm=${serieForm}` +
    `&contrato=${contrato}` +
    `&tipocom=${tipocom}` +
    `&busqBnd=${busqBnd}`;

  try {
    console.log('getDashboardVentas URL:', url);
    const { data } = await loginApi.get<Dashboard>(url);
    console.log('getDashboardVentas response:', JSON.stringify(data));

    // Normaliza arreglos para que la vista no truene si alguno viene vacío/null.
    return {
      periodo: data?.periodo ?? '',
      kpis: {
        ventasPeriodo: asNumber(data?.kpis?.ventasPeriodo),
        clientesActivos: asNumber(data?.kpis?.clientesActivos),
        forecastMes: asNumber(data?.kpis?.forecastMes),
        crecimientoYtd: asNumber(data?.kpis?.crecimientoYtd),
      },
      tendenciaVentas: asArray(data?.tendenciaVentas),
      topClientes: asArray(data?.topClientes),
      ventasPorLineaNegocio: asArray(data?.ventasPorLineaNegocio),
      ventasPorProductoServicio: asArray(data?.ventasPorProductoServicio),
    };
  } catch (error) {
    console.error('Error fetching dashboard ventas:', error);
    throw error;
  }
};
