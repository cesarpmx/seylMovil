import { loginApi } from '../../../config/api/loginApi';

export interface ProductoBusquedaItem {
  prdid: number;
  prdclave: string;
  prdnombre: string;
  prdualid?: string;
  prdinner?: number;
  prdmoncosto?: string;
  prdcosto?: number;
}

interface RawItem {
  prdid?: number;
  prdclave?: string;
  prdnombre?: string;
  prdualid?: string;
  prdinner?: number;
  prdmoncosto?: string;
  prdcosto?: number;
}

const fetchBy = async (
  empresa: string,
  param: 'clave' | 'descripcion',
  query: string,
): Promise<ProductoBusquedaItem[]> => {
  try {
    const url =
      param === 'clave'
        ? `/ventas/productos/?empresa=${empresa}&estatus=A&clave=${encodeURIComponent(query)}`
        : `/productos/productos/?empresa=${empresa}&estatus=A&limit=20&offset=0&descripcion=${encodeURIComponent(query)}`;
    const { data } = await loginApi.get<{ items: RawItem[] }>(url);
    if (!data || !Array.isArray(data.items)) return [];
    return data.items
      .filter(it => it.prdid && it.prdclave && it.prdclave !== '-1')
      .map(it => ({
        prdid: it.prdid as number,
        prdclave: it.prdclave as string,
        prdnombre: it.prdnombre ?? '',
        prdualid: it.prdualid,
        prdinner: it.prdinner,
        prdmoncosto: it.prdmoncosto,
        prdcosto: it.prdcosto,
      }));
  } catch (e) {
    return [];
  }
};

export const searchProductos = async (
  empresa: string,
  query: string,
): Promise<ProductoBusquedaItem[]> => {
  const q = query.trim().toUpperCase();
  if (!empresa || q.length < 3) return [];

  const [porClave, porDesc] = await Promise.all([
    fetchBy(empresa, 'clave', q),
    fetchBy(empresa, 'descripcion', q),
  ]);

  const map = new Map<number, ProductoBusquedaItem>();
  [...porClave, ...porDesc].forEach(it => {
    if (!map.has(it.prdid)) map.set(it.prdid, it);
  });
  return Array.from(map.values()).slice(0, 30);
};
