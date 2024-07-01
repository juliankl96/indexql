import {UnaryOperator} from "./unnary-operation";
import {BitwiseOperation} from "./bitwise-operation";
import {FilterClaus} from "../clause/filter-clause";
import {OverClause} from "../clause/over-clause";
import {Like, SubExp} from "./sub-exp";
import {TableFunction} from "./table-function";
import {RaiseFunctionType} from "./raise-function";
import {Type} from "./data-types";
import {SelectStatement} from "../select-statement";

/*
https://www.sqlite.org/syntax/expr.html
 */
export interface Exp {

}

export class LiteralValue implements Exp {

    private _type: Type;

    constructor(type: Type) {
        this._type = type;
    }

    get type(): Type {
        return this._type;
    }

    toSql(): string {
        return this._type.toString();
    }

    get regex(): RegExp {
        return /((\d+)|('.*')|NULL|FALSE|TRUE|CURRENT_TIME|CURRENT_DATE|CURRENT_TIMESTAMP)/gmi
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

    toSql(): string {
        return this._parameter;
    }

    get regex(): RegExp {
        return /((([?:@$])<\w+>)|(\?))/gmi
    }
}

export class Column implements Exp {

    private _schema?: string;
    private _table?: string;
    private _column: string;


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

    toSql(): string {
        if (this._schema) {
            return `${this._schema}.${this._table}.${this._column}`;
        }
        if (this._table) {
            return `${this._table}.${this._column}`;
        }
        return this._column;
    }

    get regex(): RegExp {
        return /((\w+)\.)?((\w+)\.)?(\w+)/gmi
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

    get regex(): RegExp {
        return /((NOT\s)|[+-~]).+/gmi
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

    get operator(): BitwiseOperation {
        return this._operator;
    }

    get regex(): RegExp {
        return /(.+) (&|>>|<<|XOR|BIT_COUNT\(\)|\||~) (.+)/gmi
    }

}


export class FunctionCall implements Exp {

    private _name: string;
    private _arguments: string[];
    private _filterClause?: FilterClaus;
    private _overClause?: OverClause;


    constructor(name: string, args: string[]) {
        this._name = name;
        this._arguments = args;
    }

    get name(): string {
        return this._name;
    }

    get arguments(): string[] {
        return this._arguments;
    }

    toSql(): string {
        let result = `${this._name}(${this._arguments.join(', ')})`;
        if (this._filterClause) {
            result += this._filterClause.toSql();
        }
        if (this._overClause) {
            result += this._overClause.toSql();
        }
        return result;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class ExpressionList implements Exp {

    private _expressions: Exp[];

    constructor(expressions: Exp[]) {
        this._expressions = expressions;
    }

    get expressions(): Exp[] {
        return this._expressions;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Cast implements Exp {

    private _exp: Exp;
    private _type: Type;
    private _alias?: string;

    constructor(exp: Exp, type: Type, alias?: string) {
        this._exp = exp;
        this._type = type;
        this._alias = alias;
    }

    get exp(): Exp {
        return this._exp;
    }

    get type(): Type {
        return this._type;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Collate implements Exp {

    private _exp: Exp;
    private _collation: string;

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

    private not: boolean;
    private _subExp: SubExp;
    private _escape?: SubExp;

    constructor(subExp: SubExp, not: boolean = false, escape?: SubExp) {
        this._subExp = subExp;
        this.not = not;
        this._escape = escape;
        if (!(this._subExp instanceof Like) && !!this._escape) {
            throw new Error('Escape is only allowed for LIKE');
        }
    }


    get subExp(): SubExp {
        return this._subExp;
    }

    toSql(): string {
        let result = `${this.not ? 'NOT ' : ''}${this._subExp.toSql()}`;
        if (this._escape) {
            result += ` ESCAPE ${this._escape.toSql()}`;
        }
        return result;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class NullExp implements Exp {

    private _exp: Exp;
    private _state: "ISNULL" | "NOTNULL" | "NOT NULL";

    constructor(exp: Exp, state: "ISNULL" | "NOTNULL" | "NOT NULL") {
        this._exp = exp;
        this._state = state;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Distinct implements Exp {

    private _not: boolean;
    private _distinctFrom: boolean;
    private _exp: Exp;
    private _from: Exp;

    constructor(exp: Exp, from: Exp, not: boolean = false, distinctFrom: boolean = false) {
        this._exp = exp;
        this._from = from;
        this._not = not;
        this._distinctFrom = distinctFrom;
    }

    get regex(): RegExp {
        return undefined;
    }
}

export class Between implements Exp {

    private _exp: Exp;
    private _start: Exp;
    private _end: Exp;
    private _not: boolean;

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
    private _tableName: string | TableFunction;
    private _tableFunction: TableFunction;
    private _fnList: Exp[];

    constructor(exp?: Exp, selection?: Exp[] | SelectStatement, schemaName?: string, tableName?: string, tableFunction?: TableFunction, fnList: Exp[] = [], not: boolean = false) {
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

    constructor(raiseFn: RaiseFunctionType, error?: string) {
        this._raiseFn = raiseFn;
        this._error = error;
    }

    toSql(): string {
        if (this._raiseFn === RaiseFunctionType.IGNORE) {
            return `RAISE(${this._raiseFn})`;
        }
        return `RAISE(${this._raiseFn}, ${this._error})`;
    }

    get regex(): RegExp {
        return undefined;
    }
}


