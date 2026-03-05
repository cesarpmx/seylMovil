export interface UbicacionResponse {
    items:   Item[];
    hasMore: boolean;
    limit:   number;
    offset:  number;
    count:   number;
    links:   Link[];
}

export interface Item {
    totalrecs:    number | null;
    ubiid:        null | string;
    ubialmid:     null | string;
    ubiprioridad: number | null;
    ubinivel:     number | null;
    ubiestatus:   null | string;
}

export interface Link {
    rel:  string;
    href: string;
}
