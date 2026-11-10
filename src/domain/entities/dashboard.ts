export interface DashboardKpis {
  ventasPeriodo: number;
  clientesActivos: number;
  forecastMes: number;
  crecimientoYtd: number;
}

export interface TendenciaVentas {
  mes: string;
  ventas: number;
  meta: number;
  ventasAnterior: number;
}

export interface TopCliente {
  cliente: string;
  ventas: number;
  porcentajeTotal: number;
  variacionMesAnterior: number;
}

export interface VentaLineaNegocio {
  servicio: string;
  ventas: number;
  porcentaje: number;
}

export interface VentaProductoServicio {
  producto: string;
  ventas: number;
  porcentaje: number;
}

export interface Dashboard {
  periodo: string;
  kpis: DashboardKpis;
  tendenciaVentas: TendenciaVentas[];
  topClientes: TopCliente[];
  ventasPorLineaNegocio: VentaLineaNegocio[];
  ventasPorProductoServicio: VentaProductoServicio[];
}
