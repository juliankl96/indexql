import {Token} from "../../token";

export class TokenResult<R> {
    private _result: R;
    private _token: Token


    constructor(result: R, token: Token) {
        this._result = result;
        this._token = token;
    }

    public static of<R>(result: R, token: Token): TokenResult<R> {
        return new TokenResult(result, token);
    }

    public static empty<R>(token: Token): TokenResult<R> {
        return new TokenResult(undefined, token);
    }


    public hasResult(): boolean {
        return this._result !== undefined
    }

    public get result(): R {
        return this._result;
    }

    public get token(): Token {
        return this._token;
    }
}