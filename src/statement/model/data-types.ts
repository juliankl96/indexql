export declare type TRUE = true;

export declare type FALSE = false;

export declare type NULL = null;

export declare type INTEGER = number;

export declare type CURRENT_TIME = string;

export declare type CURRENT_DATE = string;

export declare type CURRENT_TIMESTAMP = string;
export declare type BLOB = string;


export declare type TYPE =
    string
    | number
    | TRUE
    | FALSE
    | NULL
    | INTEGER
    | BLOB
    | CURRENT_TIME
    | CURRENT_DATE
    | CURRENT_TIMESTAMP;