export class ResultSet {
    private _data: object[];
    private _index: number;

    constructor(data: object[] = []) {
        this._data = data;
        this._index = 0;
    }

    public next<T>(): T {
        return this._data[this._index++] as T;
    }


    static empty(): ResultSet {
        return new ResultSet();
    }
}