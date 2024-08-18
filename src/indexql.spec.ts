import {indexql} from "./indexql";
import 'fake-indexeddb/auto';


describe('indexql', () => {



    it('should create a table', (cb) => {

        const connection = indexql.createConnection('test');

        connection.connect((err) => {
            expect(err).toBeNull();
            connection.query('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', (err, result) => {
                expect(err).toBeNull();
                expect(result).toBeUndefined();
                cb();
            });
        });


    });
});