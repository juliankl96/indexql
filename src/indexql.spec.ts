import "fake-indexeddb/auto";
import {indexql} from "./indexql";

describe('indexql', () => {

    it('should create a table', (cb) => {
        const connection = indexql.createConnection('test');
        connection.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', (err, result) => {
            expect(err).toBeNull();
            expect(result).toBeUndefined();
            cb();
        });

    });

});