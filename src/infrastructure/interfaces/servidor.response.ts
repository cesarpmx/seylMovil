export interface ServerItems {
    items: Item[];
    hasMore: boolean;
    limit: number;
    offset: number;
    count: number;
    links: Link[];
  }
  
  export interface Item {
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
  