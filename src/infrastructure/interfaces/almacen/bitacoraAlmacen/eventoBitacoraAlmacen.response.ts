export interface EventoBitacoraAlmacenResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    tevid:      string;
    tevnombre:  string;
    tevmodulo:  string;
    tevestatus: string;
}

export interface Link {
    rel:  string;
    href: string;
}
