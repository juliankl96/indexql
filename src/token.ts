export enum Type {
    SELECT = 'SELECT',
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    CREATE_TABLE = 'CREATE TABLE',
    DROP_TABLE = 'DROP TABLE',
    ALTER_TABLE = 'ALTER TABLE',
    CREATE_INDEX = 'CREATE INDEX',
    DROP_INDEX = 'DROP INDEX',
    BEGIN_TRANSACTION = 'BEGIN TRANSACTION',
    COMMIT = 'COMMIT',
    ROLLBACK = 'ROLLBACK',
    VACUUM = 'VACUUM',
    REINDEX = 'REINDEX',
    ANALYZE = 'ANALYZE',
    PRAGMA = 'PRAGMA',
}


export class TokenIterator {

    private static readonly tokenPattern: RegExp = /\s*(=>|<=|>=|<>|!=|[(),<>;=*+-/]|[a-zA-Z_][a-zA-Z0-9_]*|'[^']*'|"[^"]*"|`[^`]*`|\d+(\.\d+)?|".*?"|'.*?')\s*/gmi
    private sql: string;
    private position: number;
    private tokens: string[];
    private currentToken: string;

    constructor(sql) {
        this.sql = sql.trim();
        this.position = 0;
        this.tokens = (this.sql.match(TokenIterator.tokenPattern) || []).map(value => value.trim());
        this.currentToken = null;
    }

    public hasNext(): boolean {
        return this.position < this.tokens.length;
    }

    public next(): string {
        if (!this.hasNext()) {
            return null;
        }
        this.currentToken = this.tokens[this.position++];
        return this.currentToken
    }

    public type(): Type {
        const firstToken = (this.tokens[0] ?? '').toUpperCase();
        const secondToken = (this.tokens[1] ?? '').toUpperCase();
        const thirdToken = (this.tokens[2] ?? '').toUpperCase();
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