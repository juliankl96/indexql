import {DatabaseWrapper} from "./database-wrapper";
import 'fake-indexeddb/auto';

describe('database-wrapper', () => {

    it('should open the database', async () => {
        const databaseWrapper = new DatabaseWrapper('test');
        const db = await databaseWrapper.open();
        expect(db).toBe(true);
    });

    it('should create a table', async () => {
        const databaseWrapper = await new DatabaseWrapper('test').andOpen();
        const idbObjectStore = await databaseWrapper.createObjectStore('test');
        expect(idbObjectStore).not.toBeNull();
        idbObjectStore.createIndex('test', 'test', {unique: false})
        idbObjectStore.transaction.commit();

        const tables = await databaseWrapper.getTables();
        expect(tables).toContain('test');
    });
});