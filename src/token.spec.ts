import {TokenIterator} from "./token";

describe('token', () => {

    it('should return a token', () => {
        const rawSQL = "SELECT * FROM users;";
        const tokenIterator = new TokenIterator(rawSQL);
        expect(tokenIterator.next()).toBe("SELECT");
        expect(tokenIterator.next()).toBe("*");
        expect(tokenIterator.next()).toBe("FROM");
        expect(tokenIterator.next()).toBe("users");
        expect(tokenIterator.next()).toBe(";");
        expect(tokenIterator.next()).toBe(null);
    });

    describe('handle type', () => {
        it('should handle SELECT', () => {
            const rawSQL = "SELECT * FROM users;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("SELECT");
        });

        it('should handle INSERT', () => {
            const rawSQL = "INSERT INTO users VALUES (1, 'John Doe');";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("INSERT");
        });

        it('should handle UPDATE', () => {
            const rawSQL = "UPDATE users SET name = 'Jane Doe' WHERE id = 1;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("UPDATE");
        });

        it('should handle DELETE', () => {
            const rawSQL = "DELETE FROM users WHERE id = 1;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("DELETE");
        });

        it('should handle CREATE TABLE', () => {
            const rawSQL = "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("CREATE TABLE");
        });

        it('should hande CREATE TEMP TABLE', () => {
            const rawSQL = "CREATE TEMP TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("CREATE TABLE");
        });

        it('should hande CREATE TEMPORARY TABLE', () => {
            const rawSQL = "CREATE TEMPORARY TABLE users (id INTEGER PRIMARY KEY, name TEXT);";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("CREATE TABLE");
        });

        it('should handle DROP TABLE', () => {
            const rawSQL = "DROP TABLE users;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("DROP TABLE");
        });

        it('should handle ALTER TABLE', () => {
            const rawSQL = "ALTER TABLE users ADD COLUMN age INTEGER;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("ALTER TABLE");
        });

        it('should handle CREATE INDEX', () => {
            const rawSQL = "CREATE INDEX idx_name ON users (name);";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("CREATE INDEX");
        });

        it('should handle DROP INDEX', () => {
            const rawSQL = "DROP INDEX idx_name;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("DROP INDEX");
        });

        it('should handle BEGIN TRANSACTION', () => {
            const rawSQL = "BEGIN TRANSACTION;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("BEGIN TRANSACTION");
        });

        it('should handle COMMIT', () => {
            const rawSQL = "COMMIT;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("COMMIT");
        });

        it('should handle ROLLBACK', () => {
            const rawSQL = "ROLLBACK;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("ROLLBACK");
        });

        it('should handle PRAGMA', () => {
            const rawSQL = "PRAGMA table_info(users);";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("PRAGMA");
        });

        it('should handle VACUUM', () => {
            const rawSQL = "VACUUM;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("VACUUM");
        });

        it('should handle REINDEX', () => {
            const rawSQL = "REINDEX;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("REINDEX");
        });

        it('should handle ANALYZE', () => {
            const rawSQL = "ANALYZE;";
            const tokenIterator = new TokenIterator(rawSQL);
            expect(tokenIterator.type()).toBe("ANALYZE");
        });

    });
});