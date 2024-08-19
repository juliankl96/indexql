import {indexql} from "./indexql";
import 'fake-indexeddb/auto';
import {DatabaseWrapper} from "./database/database-wrapper";


describe('indexql', () => {


    it('should create a table', (cb) => {

        const connection = indexql.createConnection('test');

        connection.connect((err) => {
            expect(err).toBeNull();
            connection.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', async (err, result) => {
                expect(err).toBeNull();
                expect(result).not.toBeUndefined();
                const databaseWrapper = await DatabaseWrapper.createAndOpen('test');
                const buckets = await databaseWrapper.getTables();
                expect(buckets).toContain('test');
                cb();
            });
        });

    });
});