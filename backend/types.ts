export type Song = {
    title: string; 
    genre: string;
    artist: string;
    version: string;
    beginnerDiff: string;
    normalDiff: string;
    hyperDiff: string;
    anotherDiff: string;
    leggendariaDiff: string;
    playedDate: number;
    requestDiff: string;
}

export type User = {
    data: Array<Song>
}

export type SongDatabase = {
    [room: string]: Array<Song>
}

export type Difficulties =  {
    beginner: boolean;
    normal: boolean;
    hyper: boolean;
    another: boolean;
    leggendaria: boolean;
}
export type Recent = {
    filter: boolean
}
export type LevelFilters = {
    "1": boolean;
    "2": boolean;
    "3": boolean;
    "4": boolean;
    "5": boolean;
    "6": boolean;
    "7": boolean;
    "8": boolean;
    "9": boolean;
    "10": boolean;
    "11": boolean;
    "12": boolean;
}

export type FilterDb = {
    [room: string] : Array<Array<LevelFilters>|Array<Difficulties>>
}

export type CooldownDb ={
    [room: string] : number
}

export type StyleFilters = {
    "1st&substream" : boolean,
    "2nd style" : boolean,
    "3rd style" : boolean,
    "4th style" : boolean,
    "5th style" : boolean,
    "6th style" : boolean,
    "7th style" : boolean,
    "8th style" : boolean,
    "9th style" : boolean,
    "10th style" : boolean,
    "IIDX RED" : boolean,
    "HAPPY SKY" : boolean,
    "DistorteD" : boolean,
    "GOLD" : boolean,
    "DJ TROOPERS" : boolean,
    "EMPRESS" : boolean,
    "SIRIUS" : boolean,
    "Resort Anthem" : boolean,
    "Lincle" : boolean,
    "tricoro" : boolean,
    "SPADA" : boolean,
    "PENDUAL" : boolean,
    "copula" : boolean,
    "SINOBUZ" : boolean,
    "CANNON BALLERS" : boolean,
    "Rootage" : boolean,
    "HEROIC VERSE" : boolean,
    "BISTROVER" : boolean,
    "CastHour" : boolean,
    "RESIDENT" : boolean,
    "EPOLIS" : boolean

}

export type IsColumnDb = {
    [room: string]: boolean

}

export type SentRequestDb = {
    [room: string]: SentRequest
}

export type SentRequest = {
    [user: string]: Array<Song>
}

export type HostKeysDb = {
    [room: string]: string
}

export type TextDb = {
    [textArea: string]: LanguageOptions
}

export type LanguageOptions = {
    [language: string]: string
}