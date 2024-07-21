import {Column, Exp} from "./exp";
import {Token} from "../../token";
import {ExpFactory} from "./exp-factory";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";

export class ResultColumnResult {

    private _result: ResultColumn;
    private _token: Token;

    constructor(token: Token, result?: ResultColumn) {
        this._token = token;
        this._result = result;
    }

    static noResult(token: Token) {
        return new ResultColumnResult(token);
    }

    get result(): ResultColumn {
        return this._result;
    }

    get token(): Token {
        return this._token;
    }
}


export class ResultColumn {
    private readonly _exp: Exp;
    private readonly _alias: string | undefined;
    private readonly _tableName: string | undefined;
    private readonly _star: boolean;


    public static createViaExp(exp: Exp, alias?: string): ResultColumn {
        return new ResultColumn(exp, alias);
    }

    public static createViaStar(tablename?: string): ResultColumn {
        return new ResultColumn(undefined, undefined, tablename, true);
    }


    protected constructor(exp?: Exp, alias?: string, tableName?: string, star: boolean = false) {
        this._exp = exp;
        this._alias = alias;
        this._tableName = tableName;
        this._star = star;
    }

    get star(): boolean {
        return this._star;
    }

    get tableName(): string | undefined {
        return this._tableName;
    }

    get exp(): Exp {
        return this._exp;
    }

    get alias(): string | undefined {
        return this._alias;
    }

    get regex(): RegExp {
        return undefined;
    }
}


export class ResultColumnFactory {

    protected static handleAlias(token: Token, exp: Exp): ResultColumnResult {
        if (token === undefined) {
            return ResultColumnResult.noResult(token);
        }
        if (token.value.toUpperCase() === 'AS') {
            token = token.next;
            const alias = ResultColumn.createViaExp(exp, token.value);
            return new ResultColumnResult(token.next, alias);
        }

        return new ResultColumnResult(token, ResultColumn.createViaExp(exp));
    }

    protected static handleStarWithTable(token: Token, column: Column): ResultColumnResult {
        if (token.next?.value !== '.') {
            return ResultColumnResult.noResult(token);
        }
        let index = token.next.next;
        if (index.value !== '*') {
            return ResultColumnResult.noResult(token);
        }
        if (column.table || column.schema) {
            throw new SqliteError(SQLITE_ERROR, 'near "*": syntax error')            ;
        }
        index = index.next;
        const resultColumn = ResultColumn.createViaStar(column.column);
        return new ResultColumnResult(index, resultColumn)
    }


    public static createResultColumn(token: Token): ResultColumnResult {
        const expResult = ExpFactory.transformExp(token);
        if (expResult.exp instanceof Column) {
            const columnWithTable = ResultColumnFactory.handleStarWithTable(token, expResult.exp as Column);
            if (columnWithTable.result) {
                return columnWithTable;
            }
        }


        if (expResult.exp) {

            const alias = ResultColumnFactory.handleAlias(expResult.token, expResult.exp);
            if (alias.result) {
                return alias;
            }
            return new ResultColumnResult(expResult.token, ResultColumn.createViaExp(expResult.exp));
        }
        if (token.value === '*') {
            return new ResultColumnResult(token.next, ResultColumn.createViaStar());
        }


        return ResultColumnResult.noResult(token);
    }


}