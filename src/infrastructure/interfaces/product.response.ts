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

export interface Link {
  rel: string;
  href: string;
}
