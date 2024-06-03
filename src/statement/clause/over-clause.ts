import {Exp} from "../model/exp";

export class OverClause{
    private _partitionBy: Exp[];
    private _orderBy: string[];
    private _windowFrame: string;

    constructor(partitionBy: Exp[], orderBy: string[], windowFrame: string) {
        this._partitionBy = partitionBy;
        this._orderBy = orderBy;
        this._windowFrame = windowFrame;
    }

    get partitionBy(): Exp[] {
        return this._partitionBy;
    }

    get orderBy(): string[] {
        return this._orderBy;
    }

    get windowFrame(): string {
        return this._windowFrame;
    }

    toSql(): string {
        return `OVER (PARTITION BY ${this._partitionBy.map(exp => exp.toSql()).join(', ')} ORDER BY ${this._orderBy.join(', ')} ${this._windowFrame})`;
    }
}