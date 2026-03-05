export interface ProductoResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    prdid:         number;
    prdclave:      string;
    prdnombre:     string;
    prdualid:      string;
    prdinner:      number;
    prdmoncosto:   string;
    prdcosto:      number;
    prdinventario: string;
    precio:        number;
}

export interface Link {
    rel:  string;
    href: string;
}
