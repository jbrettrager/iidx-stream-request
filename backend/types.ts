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