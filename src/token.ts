import {Type} from "./statement/statement";

export class Token {
    private _value: string;
    private _start: number;

    constructor(value: string, start: number) {
        this._value = value;
        this._start = start;
    }

    get value(): string {
        return this._value;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._start + this._value.length;

    }
}

export class TokenIterator {

    private static readonly tokenPattern: RegExp = /\s*(=>|<=|>=|<>|!=|[(),<>;=*+-/]|[a-zA-Z_][a-zA-Z0-9_]*|'[^']*'|"[^"]*"|`[^`]*`|\d+(\.\d+)?|".*?"|'.*?')\s*/gmi
    private sql: string;
    private position: number;
    private tokens: Token[];
    private currentToken: Token;

    constructor(sql) {
        this.sql = sql;
        this.position = 0;
        this.tokens = (this.sql.match(TokenIterator.tokenPattern) || []).map(value => {
            const trimmed = value.trim()
            const start = this.sql.indexOf(trimmed);
            return new Token(trimmed, start);
        });
        this.currentToken = null;
        this.validateTokens();
    }

    protected validateTokens() {
        let lastPos = 0;
        const endToken: Token = new Token(null, this.sql.length);
        const tokens = this.tokens.concat([endToken]);
        for (const token of tokens) {
            if (token.value === '') {
                throw new Error('Empty token found');
            }
            const valueBetweenTokens = this.sql.substring(lastPos, token.start);
            for (let i = 0; i < valueBetweenTokens.length; i++) {
                const char = valueBetweenTokens[i];
                if (char.trim() !== '') {
                    throw new Error('Invalid token"' + char + '" found at position ' + lastPos + '" in "' + this.sql + '"')
                }
            }
            lastPos = token.end;
        }
    }

    public hasNext(): boolean {
        return this.position < this.tokens.length;
    }

    public next(): string {
        if (!this.hasNext()) {
            return null;
        }
        this.currentToken = this.tokens[this.position++];
        return this.currentToken.value;
    }

    public currentPos(): number {
        return this.currentToken.start;
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