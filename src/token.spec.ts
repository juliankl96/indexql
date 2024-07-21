import {TokenArray} from "./token";

describe('token', () => {

    it('should return a token', () => {
        const rawSQL: string = "SELECT * FROM users;";
        const splits: string[] = ['SELECT', '*', 'FROM', 'users', ';']
        let token = TokenArray.fromString(rawSQL).getFirstToken();

        for (const split of splits) {
            expect(token.value).toBe(split);
            token = token.next;
        }

        expect(token).toBeUndefined();
    });

    it('should handle invalid char in sql', () => {
        const rawSQL: string = "SELECT * FROM users;#";
        expect(() => TokenArray.fromString(rawSQL)).toThrowError("SQLITE_ERROR: sqlite3 result code 1:unrecognized token: \"#\"");
    });

    describe('handle type', () => {
        it('should handle SELECT', () => {
            const rawSQL: string = "SELECT * FROM users;";
            const tokenArray: TokenArray = TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("SELECT");
        });

        it('should handle INSERT', () => {
            const rawSQL: string = "INSERT INTO users VALUES (1, 'John Doe');";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("INSERT");
        });

        it('should handle UPDATE', () => {
            const rawSQL: string = "UPDATE users SET name = 'Jane Doe' WHERE id = 1;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("UPDATE");
        });

        it('should handle DELETE', () => {
            const rawSQL: string = "DELETE FROM users WHERE id = 1;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("DELETE");
        });

        it('should handle CREATE TABLE', () => {
            const rawSQL: string = "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("CREATE TABLE");
        });

        it('should hande CREATE TEMP TABLE', () => {
            const rawSQL: string = "CREATE TEMP TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("CREATE TABLE");
        });

        it('should hande CREATE TEMPORARY TABLE', () => {
            const rawSQL: string = "CREATE TEMPORARY TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("CREATE TABLE");
        });

        it('should handle DROP TABLE', () => {
            const rawSQL: string = "DROP TABLE users;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("DROP TABLE");
        });

        it('should handle ALTER TABLE', () => {
            const rawSQL: string = "ALTER TABLE users ADD COLUMN age INTEGER;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("ALTER TABLE");
        });

        it('should handle CREATE INDEX', () => {
            const rawSQL: string = "CREATE INDEX idx_name ON users (name);";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("CREATE INDEX");
        });

        it('should handle DROP INDEX', () => {
            const rawSQL: string = "DROP INDEX idx_name;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("DROP INDEX");
        });

        it('should handle BEGIN TRANSACTION', () => {
            const rawSQL: string = "BEGIN TRANSACTION;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("BEGIN TRANSACTION");
        });

        it('should handle COMMIT', () => {
            const rawSQL: string = "COMMIT;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("COMMIT");
        });

        it('should handle ROLLBACK', () => {
            const rawSQL: string = "ROLLBACK;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("ROLLBACK");
        });

        it('should handle PRAGMA', () => {
            const rawSQL: string = "PRAGMA table_info(users);";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("PRAGMA");
        });

        it('should handle VACUUM', () => {
            const rawSQL: string = "VACUUM;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("VACUUM");
        });

        it('should handle REINDEX', () => {
            const rawSQL: string = "REINDEX;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("REINDEX");
        });

        it('should handle ANALYZE', () => {
            const rawSQL: string = "ANALYZE;";
            const tokenArray: TokenArray =  TokenArray.fromString(rawSQL);
            expect(tokenArray.type()).toBe("ANALYZE");
        });

    });
});