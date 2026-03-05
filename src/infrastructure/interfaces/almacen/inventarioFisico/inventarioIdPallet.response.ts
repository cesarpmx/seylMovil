export interface InventarioFisicoIDPallet {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    racid:           number;
    raclote:         string;
    racfeccaducidad: Date;
    racubiid:        string;
    disponible:      number;
    racprdid:        number;
    prdclave:        string;
    prdnombre:       string;
    prdualid:        string;
    prdinner:        number;
    racreal:         number;
    racreservado:    number;
}

export interface Link {
    rel:  string;
    href: string;
}