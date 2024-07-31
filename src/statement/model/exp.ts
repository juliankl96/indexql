import {UnaryOperator} from "./unnary-operation";
import {BitwiseOperation} from "./bitwise-operation";
import {FilterClaus} from "../clause/filter-clause";
import {OverClause} from "../clause/over-clause";
import {Like} from "./sub-exp";
import {RaiseFunctionType} from "./raise-function";
import {DataType} from "./data-types";
import {SelectStatement} from "../select-statement";

/*
https://www.sqlite.org/syntax/expr.html
 */
export interface Exp {

    name: string;

}


/**
 * https://www.sqlite.org/syntax/literal-value.html
 */
export class LiteralValue implements Exp {

    private readonly _type: DataType;
    public readonly name: "LiteralValue"

    constructor(type: DataType) {
        this._type = type;
    }

    get type(): DataType {
        return this._type;
    }

}

export class BindParameter implements Exp {

    private readonly _parameter: string;
    public readonly name: "BindParameter"

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
    public readonly name: "Column"

    constructor(column: string, table?: string, schema?: string) {
        this._column = column;
        this._table = table;
        this._schema = schema;
    }

    get table(): string {
        return this._table;
    }

    get column(): string {
        return this._column;
    }

    get schema(): string {
        return this._schema;
    }

}

export class UnaryOperation implements Exp {

    private readonly _operator: UnaryOperator;
    private readonly _exp: Exp;
    public readonly name: "UnaryOperation"

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

    get regex(): RegExp {
        return /((NOT\s)|[+-~]).+/gmi
    }
}

export class BinaryOperation implements Exp {

    private readonly _left: Exp;
    private readonly _right: Exp;
    private _operator: BitwiseOperation
    public readonly name: "BinaryOperation"

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

}


export class FunctionCall implements Exp {

    private readonly _name: string;
    private readonly _arguments: string[];
    private readonly _filterClause?: FilterClaus;
    private readonly _overClause?: OverClause;
    public readonly name: "FunctionCall"

    constructor(name: string, args: string[], filterClause?: FilterClaus, overClause?: OverClause) {
        this._name = name;
        this._arguments = args;
        this._filterClause = filterClause;
        this._overClause = overClause;
    }

    get functionName(): string {
        return this._name;
    }

    get arguments(): string[] {
        return this._arguments;
    }

    get filterClause(): FilterClaus {
        return this._filterClause;
    }

    get overClause(): OverClause {
        return this._overClause;
    }

}

export class ExpressionList implements Exp {

    private _expressions: Exp[];
    public readonly name: "ExpressionList"

    constructor(expressions: Exp[]) {
        this._expressions = expressions;
    }

    get expressions(): Exp[] {
        return this._expressions;
    }

}

export class Cast implements Exp {

    private _exp: Exp;
    private _type: string;
    public readonly name: "Cast"

    constructor(exp: Exp, type?: string) {
        this._exp = exp;
        this._type = type;
    }

    get exp(): Exp {
        return this._exp;
    }

    get type(): string {
        return this._type;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Collate implements Exp {

    private _exp: Exp;
    private _collation: string;
    public readonly name: "Collate"


    constructor(exp: Exp, collation: string) {
        this._exp = exp;
        this._collation = collation;
    }

    get exp(): Exp {
        return this._exp;
    }

    get collation(): string {
        return this._collation;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class PatternMatching implements Exp {

    private _not: boolean;
    private _exp: Exp;
    private _escape?: Exp;
    public readonly name: "PatternMatching"

    constructor(exp: Exp, not: boolean = false, escape?: Exp) {
        this._exp = exp;
        this._not = not;
        this._escape = escape;
        if (!(this._exp instanceof Like) && !!this._escape) {
            throw new Error('Escape is only allowed for LIKE');
        }
    }

    get exp(): Exp {
        return this._exp;
    }

    get escape(): Exp {
        return this._escape;
    }

    isNot(): boolean {
        return this._not === true;
    }

}

export class NullExp implements Exp {

    private _exp: Exp;
    private _state: "ISNULL" | "NOTNULL" | "NOT NULL";
    public readonly name: "NullExp"

    constructor(exp: Exp, state: "ISNULL" | "NOTNULL" | "NOT NULL") {
        this._exp = exp;
        this._state = state;
    }

    get exp(): Exp {
        return this._exp;
    }

    get operator(): "ISNULL" | "NOTNULL" | "NOT NULL" {
        return this._state;
    }
}

export class IsExp implements Exp {

    private _not: boolean;
    private _distinctFrom: boolean;
    private _left: Exp;
    private _right: Exp;
    public readonly name: "IsExp"

    constructor(left: Exp, right: Exp, not: boolean = false, distinctFrom: boolean = false) {
        this._left = left;
        this._right = right;
        this._not = not;
        this._distinctFrom = distinctFrom;
    }

    public isNot(): boolean {
        return this._not === true;

    }

    public isDistinctFrom(): boolean {
        return this._distinctFrom === true;
    }

    public get left(): Exp {
        return this._left;
    }

    public get right(): Exp {
        return this._right;
    }
}

export class Between implements Exp {

    private _exp: Exp;
    private _start: Exp;
    private _end: Exp;
    private _not: boolean;
    public readonly name: "Between"

    constructor(exp: Exp, start: Exp, end: Exp, not: boolean = false) {
        this._exp = exp;
        this._start = start;
        this._end = end;
        this._not = not;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class In implements Exp {

    private _exp: Exp;
    private _selection: Exp[] | SelectStatement;
    private _not: boolean;
    private _schemaName: string;
    private _tableName: string | FunctionCall;
    private _tableFunction: FunctionCall;
    private _fnList: Exp[];
    public readonly name: "In"

    constructor(exp?: Exp, selection?: Exp[] | SelectStatement, schemaName?: string, tableName?: string, tableFunction?: FunctionCall, fnList: Exp[] = [], not: boolean = false) {
        this._exp = exp;
        this._selection = selection;
        this._not = not;
        this._schemaName = schemaName;
        this._tableName = tableName;
        this._tableFunction = tableFunction;
        this._fnList = fnList;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Exists implements Exp {

    private _select: SelectStatement;
    private _not: boolean;
    public readonly name: "Exists"

    constructor(select: SelectStatement, not: boolean = false) {
        this._select = select;
        this._not = not;
    }

    get select(): SelectStatement {
        return this._select;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Case implements Exp {

    private _case: Exp | null
    private _whenThen: { when: Exp, then: Exp }[];
    private _else?: Exp;
    public readonly name: "Case"

    constructor(caseExp: Exp | null, whenThen: { when: Exp, then: Exp }[], elseExp?: Exp) {
        this._case = caseExp;
        this._whenThen = whenThen;
        this._else = elseExp;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class RaiseFunction implements Exp {

    private _raiseFn: RaiseFunctionType;
    private _error?: string;
    public readonly name: "RaiseFunction"

    constructor(raiseFn: RaiseFunctionType, error?: string) {
        this._raiseFn = raiseFn;
        this._error = error;
    }

}


