import {Type} from "./statement/statement";


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

    set next(value: Token) {
        this._next = value;
    }

    public hasNext(): boolean {
        return this._next !== undefined;
    }
}

export class TokenArray {

    private static readonly tokenPattern: RegExp = /\s*(=>|<=|>=|<>|!=|[(),<>;=*+-/]|[a-zA-Z_][a-zA-Z0-9_]*|'[^']*'|"[^"]*"|`[^`]*`|\d+(\.\d+)?|".*?"|'.*?')\s*/gmi
    private tokens: Token[];

    constructor(sql: string) {
        let lastToken: Token = null;
        this.tokens = (sql.match(TokenArray.tokenPattern) || []).map(value => {
            const trimmed = value.trim()
            const start = sql.indexOf(trimmed);
            const result = new Token(trimmed, start);
            if (lastToken) {
                lastToken.next = result;
            }
            lastToken = result;
            return result;
        });

        this.validateTokens(this.tokens, sql);
    }



    private validateTokens(tokens: Token[], sql: string) {
        let lastPos = 0;

        for (const token of tokens) {
            if (token.value === '') {
                throw new Error('Empty token found');
            }
            const valueBetweenTokens = sql.substring(lastPos, token.start) || '';
            for (let i = 0; i < valueBetweenTokens.length; i++) {
                const char = valueBetweenTokens[i];
                if (char.trim() !== '') {
                    throw new Error('Invalid token"' + char + '" found at position ' + lastPos + '" in "' + sql + '"')
                }
            }
            lastPos = token.end;
        }
        const endBetweenTokens = sql.substring(lastPos) || '';
        if (endBetweenTokens.trim() !== '') {
            throw new Error('Invalid token"' + endBetweenTokens + '" found at position ' + lastPos + '" in "' + sql + '"')
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