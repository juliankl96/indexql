import {Type} from "./statement/statement";
import {SQLITE_ERROR, SqliteError} from "./error/sqlite-error";


export class Token {
    private _value: string;
    private _startPos: number;
    private _next: Token | undefined;

    constructor(value: string, start: number, next?: Token) {
        this._value = value;
        this._startPos = start;
        this._next = next;
    }

    get value(): string {
        return this._value;
    }

    /**
     * The position of the token in the sql string
     * @return {number}
     **/
    get start(): number {
        return this._startPos;
    }

    get end(): number {
        return this._startPos + this._value.length;

    }

    get next(): Token {
        return this._next;
    }

    public jump(number: number): Token {
        if (number < 0) {
            throw new Error('Negative jump not allowed');
        }
        let index: Token = this;
        for (let i = 0; i < number; i++) {
            index = index.next;
            if (index === undefined) {
                throw new Error('Jumped out of bounds');
            }
        }
        return index;
    }

    set next(value: Token) {
        this._next = value;
    }

    public hasNext(): boolean {
        return this._next !== undefined;
    }


    test(...filter: string[]) {
        let index: Token = this;
        for (const f of filter) {
            if (index?.value === f) {
                index = index.next;
            } else {
                return false;
            }
        }
        return true;
    }
}

export class TokenArray {

    private static readonly tokenPattern: RegExp = /\s*(<<|>>|=>|<=|>=|<>|!=|[(),<>;~=*+-/|&]|[a-zA-Z_][a-zA-Z0-9_]*|'[^']*'|"[^"]*"|`[^`]*`|\d+(\.\d+)?|".*?"|'.*?')\s*/gmi
    private readonly tokens: Token[];

    private constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public static fromString(sql: string): TokenArray {
        let lastToken: Token = null;
        const tokens = (sql.match(TokenArray.tokenPattern) || []).map(value => {
            const trimmed = value.trim()
            const start = sql.indexOf(trimmed);
            const result = new Token(trimmed, start);
            if (lastToken) {
                lastToken.next = result;
            }
            lastToken = result;
            return result;
        });

        this.validateTokens(tokens, sql);
        return new TokenArray(tokens);
    }


    private static validateTokens(tokens: Token[], sql: string) {
        let replacedSql = sql;
        for (const token of tokens) {
            replacedSql = replacedSql.replace(token.value, '');
        }
        if (replacedSql.trim().length > 0) {
            throw new SqliteError(SQLITE_ERROR, 'unrecognized token: \"' + replacedSql.trim() + '\"');
        }
    }

    public getFirstToken(): Token {
        return this.tokens[0];
    }

    public type(): Type {
        const firstToken = (this.tokens[0]?.value ?? '').toUpperCase();
        const secondToken = (this.tokens[1]?.value ?? '').toUpperCase();
        const thirdToken = (this.tokens[2]?.value ?? '').toUpperCase();
        switch (firstToken) {
            case 'SELECT':
                return Type.SELECT;
            case 'INSERT':
                return Type.INSERT;
            case 'UPDATE':
                return Type.UPDATE;
            case 'DELETE':
                return Type.DELETE;
            case 'CREATE':
                if (secondToken === 'TABLE' || (secondToken === 'TEMP' || secondToken === 'TEMPORARY') && thirdToken === 'TABLE') {
                    return Type.CREATE_TABLE;
                }
                if (secondToken === 'INDEX') {
                    return Type.CREATE_INDEX;
                }
                break;
            case 'DROP':
                if (secondToken === 'TABLE') {
                    return Type.DROP_TABLE;
                }
                if (secondToken === 'INDEX') {
                    return Type.DROP_INDEX;
                }
                break;
            case 'ALTER':
                if (secondToken === 'TABLE') {
                    return Type.ALTER_TABLE;
                }
                break;
            case 'BEGIN':
                if (secondToken === 'TRANSACTION') {
                    return Type.BEGIN_TRANSACTION;
                }
                break;
            case 'COMMIT':
                return Type.COMMIT;
            case 'ROLLBACK':
                return Type.ROLLBACK;
            case 'VACUUM':
                return Type.VACUUM;
            case 'REINDEX':
                return Type.REINDEX;
            case 'ANALYZE':
                return Type.ANALYZE;
            case 'PRAGMA':
                return Type.PRAGMA;

        }
        throw new Error('Unknown type: ' + this.tokens + ' ' + firstToken + ' ' + secondToken + ' ' + thirdToken);
    }


}