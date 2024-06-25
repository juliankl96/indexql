export class SqliteError extends Error {
    constructor(cresultCodede: ResultCode, message: string) {
        super(cresultCodede.name + ": sqlite3 result code " + cresultCodede.code + ":" + message);
        this.name = 'SqliteError';
    }

}

export class ResultCode {

    private _name: string;
    private _code: number;

    constructor(name: string, code: number) {
        this._name = name;
        this._code = code;
    }

    get name(): string {
        return this._name;
    }

    get code(): number {
        return this._code;
    }
}

export const SQLITE_ERROR = new ResultCode('SQLITE_ERROR', 1);
