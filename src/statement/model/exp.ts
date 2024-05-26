import {TYPE} from "./data-types";

export interface Exp {

}

export class LiteralValue implements Exp {

    private _value: TYPE;

    constructor(value: TYPE) {
        this._value = value;
    }

    get value(): TYPE {
        return this._value;
    }
}

export class BindParameter implements Exp {

    private _parameter: string;

    constructor(parameter: string) {
        this._parameter = parameter;
    }

    get parameter(): string {
        return this._parameter;
    }
}