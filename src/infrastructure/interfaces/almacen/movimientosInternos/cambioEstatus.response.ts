export interface CambioEstatusResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    racid:           number;
    prdid:           number;
    prdclave:        string;
    prdnombre:       string;
    raclote:         null;
    racfeccaducidad: null;
    racubiid:        string;
    disponible:      number;
    racineid:        string;
    raccoms:         null;
}

export interface Link {
    rel:  string;
    href: string;
}
