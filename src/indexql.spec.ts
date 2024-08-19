import {indexql} from "./indexql";
import 'fake-indexeddb/auto';
import { getBuckets} from "../test/test-util";


describe('indexql', () => {



    it('should create a table', (cb) => {

        const connection = indexql.createConnection('test');

        connection.connect((err) => {
            expect(err).toBeNull();
            connection.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', async (err, result) => {
                expect(err).toBeNull();
                expect(result).not.toBeUndefined();
                let buckets = await getBuckets('test');
                expect(buckets).toContain('test');
                cb();
            });
        });

    });
});