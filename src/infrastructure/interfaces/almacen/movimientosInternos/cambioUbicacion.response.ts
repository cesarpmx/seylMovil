export interface CambioUbicacionResponse {
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
    raclote:         string;
    racfeccaducidad: string;
    racubiid:        string;
    disponible:      number;
    racineid:        string;
}

export interface Link {
    rel:  string;
    href: string;
}
