export interface Modules {
    umomodid:    number;
    modnombre:   string;
    modcontexto: string;
    umoacceso:   number;
    modorden:    number;
    modpadre:    number | null;
    modicono:    string;
    modulos?:    Modules[]; // Esto permite que `modulos` tenga una lista de submódulos
    subModulos?: Modules[]; // Esto permite una lista de submódulos anidados
}
