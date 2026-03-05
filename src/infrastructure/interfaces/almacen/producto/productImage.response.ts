export interface ProductsItems {
    items: Item[];
    hasMore: boolean;
    limit: number;
    offset: number;
    count: number;
    links: Link[];
  }
  
  export interface Item {
    pimid: number;
    pimprdid: number;
    pimimagen: string;
  }
  
  export interface Link {
    rel: string;
    href: string;
  }
  