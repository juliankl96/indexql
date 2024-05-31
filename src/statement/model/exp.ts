import {TYPE} from "./data-types";
import {UnaryOperator} from "./unnary-operation";
import {BitwiseOperation} from "./bitwise-operation";

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

export class Column implements Exp {

    private _schema?: string;
    private _table?: string;
    private _column: string;


    constructor(param: string) {
        const regex = /((\w+)\.)?((\w+)\.)?(\w+)/gmi;
        const matches = regex.exec(param);
        if (matches === null) {
            throw new Error('Invalid column');
        }
        this._schema = matches[2];
        this._table = matches[4];
        this._column = matches[5];
    }

    get table(): string {
        return this._table;
    }

    get column(): string {
        return this._column;
    }
}

export class UnaryOperation implements Exp {

    private _operator: UnaryOperator;
    private _exp: Exp;

    constructor(operator: UnaryOperator, exp: Exp) {
        this._operator = operator;
        this._exp = exp;
    }

    get operator(): string {
        return this._operator;
    }

    get exp(): Exp {
        return this._exp;
    }
}

export class BinaryOperation implements Exp {

    private _left: Exp;
    private _right: Exp;
    private _operator: BitwiseOperation

    constructor(left: Exp, operator: BitwiseOperation, right: Exp) {
        this._left = left;
        this._right = right;
        this._operator = operator;
    }

    get left(): Exp {
        return this._left;
    }

    get right(): Exp {
        return this._right;
    }

    get operator(): BitwiseOperation{
        return this._operator;
    }
}