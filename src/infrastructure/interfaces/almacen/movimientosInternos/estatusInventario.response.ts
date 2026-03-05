export interface EstatusInventarioResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    ineid:      string;
    inesurtido: string;
    ineventa:   string;
    ineestatus: string;
}

export interface Link {
    rel:  string;
    href: string;
}
