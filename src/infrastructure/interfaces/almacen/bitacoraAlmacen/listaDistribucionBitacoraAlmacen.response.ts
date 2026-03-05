export interface ListaDistribucionBitacoraResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    eldid:        number;
    eldempid:     number;
    eldtevid:     string;
    tevnombre:    string;
    eldlistadist: string;
    eldestatus:   string;
}

export interface Link {
    rel:  string;
    href: string;
}
