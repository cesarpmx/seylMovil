export interface QREmbarqueResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    pemid:       number;
    pemempid:    number;
    pemalmid:    string;
    pemfeccarga: Date;
    proveedor:   string;
    vehplacas:   string;
    chonombre:   string;
    vehtveid:    string;
    pemruta:     string;
    pemcoms:     string;
    pemestatus:  string;
    epenombre:   string;
    pemtemid:    string;
    temnombre:   string;
}

export interface Link {
    rel:  string;
    href: string;
}
