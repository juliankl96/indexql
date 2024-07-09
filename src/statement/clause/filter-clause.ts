import {Exp} from "../model/exp";

export class FilterClaus{

    private _exp: Exp;

    constructor(exp: Exp) {
        this._exp = exp;
    }

    get exp(): Exp {
        return this._exp;
    }


}