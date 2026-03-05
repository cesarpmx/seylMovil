export interface UbicarEnvioResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    embid:      number;
    embempid:   number;
    empnombre:  string;
    embref1:    number;
    embref2:    string;
    embcajas:   number;
    clinombre:  string;
    embfecrec:  Date;
    embfeccita: Date;
    destino:    string;
    embubicacion: string;
}

export interface Link {
    rel:  string;
    href: string;
}
