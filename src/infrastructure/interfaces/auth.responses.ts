export interface AuthResponse {
    usuid:     string;
    usumail:   string;
    usunombre: string;
    items:     Item[];
    empresas:  Empresa[];
    almacenes: Almacenes[];
}

export interface Almacenes {
    almid:     string;
    almnombre: string;
}

export interface Empresa {
    empid:       number;
    empnomcorto: string;
}

export interface Item {
    umomodid:    number;
    modnombre:   string;
    modcontexto: string;
    umoacceso:   number;
    modorden:    number;
    modpadre:    number | null;
    modicono:    string;
    modulos?:    Item[];
    subModulos?: Item[];
}