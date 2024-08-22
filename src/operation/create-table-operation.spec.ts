import {indexql} from "../indexql";
import 'fake-indexeddb/auto';
import {DatabaseWrapper} from "../database/database-wrapper";
import {Connection} from "../connection";


describe('create-table-operation', () => {
    let connection: Connection;
    const databaseName = 'test-db';
    beforeEach(cb => {
        connection = indexql.createConnection(databaseName);
        connection.connect((err) => {
            expect(err).toBeNull();
            cb();
        });
    })

    it('should create a table', (cb) => {

        connection.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', async (err, result) => {
            expect(err).toBeNull();
            expect(result).not.toBeUndefined();
            const databaseWrapper = await DatabaseWrapper.createAndOpen(databaseName);
            const buckets = await databaseWrapper.getTables();
            expect(buckets).toContain('test');
            const columns = await databaseWrapper.getColumns('test');
            expect(columns).toContain('id');
            expect(columns).toContain('name');
            cb();
        });

    });

    it('should create a table using member expression', () => {
        connection.query('CREATE TABLE test.test (id INTEGER PRIMARY KEY, name TEXT)', async (err, result) => {
            expect(err).toBeNull();
            expect(result).not.toBeUndefined();
            const databaseWrapper = await DatabaseWrapper.createAndOpen(databaseName);
            const buckets = await databaseWrapper.getTables();
            expect(buckets).toContain('test.test');
            const columns = await databaseWrapper.getColumns('test.test');
            expect(columns).toContain('id');
            expect(columns).toContain('name');
        });

    });
});