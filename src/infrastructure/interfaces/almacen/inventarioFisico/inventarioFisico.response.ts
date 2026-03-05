
export interface InventarioFisicoResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    infid:      number;
    infempid:   number;
    infalmid:   string;
    infineid:   string;
    infracid:   null;
    infubiid:   string;
    infprdid:   number;
    prdclave:   string;
    prdnombre:  string;
    prdualid:   string;
    prdinner:   number;
    inflote:    string;
    inffeccad:  null;
    infuno:     number;
    infdos:     number;
    inftres:    number;
    infaplicar: number;
    infestatus: string;
    eifnombre:  string;
}

export interface Link {
    rel:  string;
    href: string;
}
