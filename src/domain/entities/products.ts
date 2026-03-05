export interface Products {
  totalrecs: number;
  prdid: number;
  prdclave: string;
  prdupc: string;
  prdclaveext: string;
  prdnombre: string;
  prdempid: number;
  prdestatus: string;
  prdlinid: string;
  plinombre: string;
  prdfamid: string;
  pfanombre: string;
  prdtprid: string;
  ptinombre: string;
  prdinventario: string;
  prdventa: string;
  prdcompuesto: string;
  prdcosto: number;
  prdmoncosto: string;
  prdprecio: number;
  prdmonprecio: string;
  prdualid: string;
  ualnombre: string;
  prdinner: number;
  prdpeso: number;
  prdunipeso: string;
  prdvolumen: string;
  prdunivol: string;
  prdopc1: string;
  prdopc2: string;
  prdopc3: string;
  prdopc4: string;
  prdopc5: string;
}

export interface ProductImage64 {
  pimid: number;
  pimprdid: number;
  pimimagen: string;
}

export interface ProductsItems {
  items: Item[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
  links: Link[];
}

export interface Item {
  totalrecs: number;
  prdid: number;
  prdclave: string;
  prdupc: string;
  prdclaveext: string;
  prdnombre: string;
  prdempid: number;
  prdestatus: string;
  prdlinid: string;
  plinombre: string;
  prdfamid: string;
  pfanombre: string;
  prdtprid: string;
  ptinombre: string;
  prdinventario: string;
  prdventa: string;
  prdcompuesto: string;
  prdcosto: number;
  prdmoncosto: string;
  prdprecio: number;
  prdmonprecio: string;
  prdualid: string;
  ualnombre: string;
  prdinner: number;
  prdpeso: number;
  prdunipeso: string;
  prdvolumen: string;
  prdunivol: string;
  prdopc1: string;
  prdopc2: string;
  prdopc3: string;
  prdopc4: string;
  prdopc5: string;
}

export interface ProductImageItem {
  items: ItemImage[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
  links: Link[];
}

export interface ItemImage {
  pimid: number;
  pimprdid: number;
  pimimagen: string;
}

export interface ServidorItem {
  items: ItemServidor[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
  links: Link[];
}

export interface ItemServidor {
  ecoid: number;
  empresa: string;
  ecologo: string;
  ecohost: string;
  ecoport: string;
  ecomail: string;
  ecoauth: string;
  ecouser: string;
  ecopassword: string;
  ecossl: string;
}

export interface Link {
  rel: string;
  href: string;
}
