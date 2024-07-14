import {Exp} from "./exp";
import {Token} from "../../token";
import {ExpFactory} from "./exp-factory";

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
        if (token.value.toUpperCase() === 'AS') {
            token = token.next;
            const alias = ResultColumn.createViaExp(exp, token.value);
            return new ResultColumnResult(token.next, alias);
        }

        return new ResultColumnResult(token, ResultColumn.createViaExp(exp));

    }

    public static createResultColumn(token: Token): ResultColumnResult {
        const expResult = ExpFactory.transformExp(token);
        if (expResult.exp) {
            return ResultColumnFactory.handleAlias(expResult.token, expResult.exp);
        }
        return ResultColumnResult.noResult(token);
    }


}