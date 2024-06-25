import {UnaryOperator} from "./unnary-operation";
import {BitwiseOperation} from "./bitwise-operation";
import {FilterClaus} from "../clause/filter-clause";
import {OverClause} from "../clause/over-clause";
import {Like, SubExp} from "./sub-exp";
import {TableFunction} from "./table-function";
import {SelectStatement} from "../select/select-statement";
import {RaiseFunctionType} from "./raise-function";
import {StatementModule, WordModule} from "../../statement-module-parser";
import {
    BlobType,
    CurrentDateType,
    CurrentTimestampType,
    CurrentTimeType,
    FalseType,
    IntegerType,
    NullType,
    StringType,
    TrueType,
    Type
} from "./data-types";

/*
https://www.sqlite.org/syntax/expr.html
 */
export interface Exp {

    toSql(): string;

    get regex(): RegExp;

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

    toSql(): string {
        return `${this._operator} ${this._exp.toSql()}`;
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

    toSql(): string {
        return `${this._left.toSql()} ${this._operator.operator} ${this._right.toSql()}`;
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

    toSql(): string {
        return `(${this._expressions.map(exp => exp.toSql()).join(', ')})`;
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

    toSql(): string {
        return `CAST(${this._exp.toSql()} AS ${this._type})`;
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

    toSql(): string {
        return `${this._exp.toSql()} COLLATE ${this._collation}`;
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

    toSql(): string {
        return `${this._exp.toSql()} ${this._state}`;
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

    toSql(): string {
        return `${this._exp.toSql()} IS ${this._not ? 'NOT ' : ''}${this._distinctFrom ? 'DISTINCT FROM' : ''}${this._from.toSql()}`;
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

    toSql(): string {
        return `${this._exp.toSql()} ${this._not ? 'NOT ' : ''}BETWEEN ${this._start.toSql()} AND ${this._end.toSql()}`;
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

    toSql(): string {

        let result = `${this._exp.toSql()} ${this._not ? 'NOT ' : ''}IN `;
        if (this._selection) {
            if (this._selection instanceof SelectStatement) {
                result += `(${this._selection.toSql()})`;
            } else {
                result += `(${this._selection.map(exp => exp.toSql()).join(', ')})`;
            }
            return result;
        }
        if (this._schemaName) {
            result += `${this._schemaName}.`;
        }
        if (this._tableName) {
            result += `${this._tableName}`;
            return result;
        }
        if (this._tableFunction) {
            result += `${this._tableFunction.toSql()}`;
            result += `(${this._fnList.map(exp => exp.toSql()).join(', ')})`;
            return result;
        }
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

    toSql(): string {
        return `${this._not ? 'NOT ' : ''}EXISTS (${this._select.toSql()})`;
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

    toSql(): string {
        let result = `CASE ${this._case ? this._case.toSql() : ''} `;
        result += this._whenThen.map(whenThen => `WHEN ${whenThen.when.toSql()} THEN ${whenThen.then.toSql()}`).join(' ');
        if (this._else) {
            result += `ELSE ${this._else.toSql()}`;
        }
        return result;
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

export class ExpFactory {

    public static createExp(selectModules: StatementModule[], rawStatement: string = selectModules.join(" ")): Exp {
        if (selectModules.length === 1 && selectModules[0] instanceof WordModule) {
            return ExpFactory.handleOneWordModule(selectModules[0] as WordModule);
        }
        throw new Error("Not implemented");
    }

    private static handleOneWordModule(statementModule: WordModule): Exp {
        switch (statementModule.value.toUpperCase()) {
            case 'NULL':
                return new LiteralValue(new NullType());
            case 'FALSE':
                return new LiteralValue(new FalseType());
            case 'TRUE':
                return new LiteralValue(new TrueType());
            case 'CURRENT_TIME':
                return new LiteralValue(new CurrentTimeType());
            case 'CURRENT_DATE':
                return new LiteralValue(new CurrentDateType());
            case 'CURRENT_TIMESTAMP':
                return new LiteralValue(new CurrentTimestampType());
        }
        // handle bind-parameter
        if (statementModule.value.startsWith(":") || statementModule.value.startsWith("@") || statementModule.value.startsWith("$") || statementModule.value.startsWith("?")) {
            return new BindParameter(statementModule.value);
        }


        const literalValue: RegExp = /(\d+)|('.*')|(X'.*')/gmi;
        const regExpExecArray: RegExpMatchArray = literalValue.exec(statementModule.value)
        if (regExpExecArray[1]) {
            return new LiteralValue(new IntegerType(parseInt(regExpExecArray[0])));
        }
        if (regExpExecArray[2] && regExpExecArray[0].startsWith("'") && regExpExecArray[0].endsWith("'")) {
            let string = regExpExecArray[0].substring(1, regExpExecArray[0].length - 1);
            return new LiteralValue(new StringType(string));
        }
        if (regExpExecArray[3] && regExpExecArray[0].startsWith("X'") && regExpExecArray[0].endsWith("'")) {
            const blob = regExpExecArray[0].substring(2, regExpExecArray[0].length - 1);
            return new LiteralValue(new BlobType(blob));
        }

        return undefined;
    }

}
