export interface QrReciboResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    prrid:       number;
    prrempid:       number;
    prralmid:  string;
    prrfeccita:  string;
    prrhoracita: string;
    prrlineatr:  string;
    prrplacas:   string;
    prrchofer:   string;
    prrtcaid:    string;
    prrcantidad: number;
    prrtveid:    string;
    prrualid:    string;
    prrdocid:    string;
    prrestatus:  string;
    eprnombre:   string;
}

export interface Link {
    rel:  string;
    href: string;
}
