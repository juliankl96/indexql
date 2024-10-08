export class DatabaseWrapper {
    private readonly _databaseName: string;
    private _version: number = 1;


    public static createAndOpen(database: string): Promise<DatabaseWrapper> {
        return new Promise<DatabaseWrapper>((resolve, reject) => {
            const databaseWrapper = new DatabaseWrapper(database);
            databaseWrapper.andOpen().then((result) => {
                resolve(databaseWrapper);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    constructor(database: string) {
        this._databaseName = database;
        this._version = 1;
    }

    public andOpen(): Promise<DatabaseWrapper> {
        return new Promise<DatabaseWrapper>((resolve, reject) => {
            this.open().then((result) => {
                resolve(this);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    protected async getDatabase(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            let idbOpenDBRequest = indexedDB.open(this._databaseName);
            idbOpenDBRequest.onerror = (event) => {
                reject(new Error("Error opening database"));
            }
            idbOpenDBRequest.onsuccess = (event) => {
                this._version = idbOpenDBRequest.result.version;
                resolve(idbOpenDBRequest.result);
            }
        });
    }

    protected async getWritableDatabase(): Promise<IDBDatabase> {
        const newVersion = this._version + 1;
        return new Promise<IDBDatabase>((resolve, reject) => {

            const idbOpenDBRequest = indexedDB.open(this._databaseName, newVersion);
            idbOpenDBRequest.onerror = (event) => {
                reject(event);
            }
            idbOpenDBRequest.onsuccess = (_event) => {
                this._version = idbOpenDBRequest.result.version;
            }

            idbOpenDBRequest.onupgradeneeded = (_event) => {
                this._version = idbOpenDBRequest.result.version;
                resolve(idbOpenDBRequest.result);
            }
        });

    }

    public async open(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            this.getDatabase().then((db) => {
                db.close();
                resolve(true);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Create an object store. If the object store already exists, it will be returned.
     * @param objectStoreName The name of the object store
     * @param parameters Optional parameters for the object store
     * Please call commitObjectStore after creating the object store to commit the transaction
     */
    public async createObjectStore(objectStoreName: string, parameters?: IDBObjectStoreParameters): Promise<IDBObjectStore> {
        const idbDatabase = await this.getWritableDatabase();
        return idbDatabase.createObjectStore(objectStoreName, parameters);
    }

    public commitObjectStore(objectStore: IDBObjectStore): Promise<void> {
        return new Promise((resolve, reject) => {
            objectStore.transaction.commit();
            objectStore.transaction.oncomplete = () => {
                resolve();
            }
            objectStore.transaction.onerror = (event) => {
                reject(event);
            }
        })

    }

    /**
     * Returns a list of tables in the database.
     * Tables are also known as object stores in IndexedDB.
     */
    async getTables(): Promise<string[]> {
        const idbDatabase = await this.getDatabase();
        let tables = [];
        for (let i = 0; i < idbDatabase.objectStoreNames.length; i++) {
            tables.push(idbDatabase.objectStoreNames.item(i));
        }
        return tables;
    }

    /**
     * Returns a list of columns in a table.
     * @param table The name of the table or object store to get the columns for.
     */
    public async getColumns(table: string): Promise<string[]> {
        const idbDatabase = await this.getDatabase();
        const idbTransaction = idbDatabase.transaction(table);
        const objectStore = idbTransaction.objectStore(table);
        const result: string[] = [];

        if (objectStore.keyPath) {
            result.push(objectStore.keyPath as string);
        }

        for (let i = 0; i < objectStore.indexNames.length; i++) {
            result.push(objectStore.indexNames.item(i));
        }
        idbTransaction.commit();
        return result;
    }

    /**
     * Returns the primary key of a table.
     * in object stores, the primary key is the keyPath.
     * @param table
     */
    public async getPrimaryKey(table: string): Promise<string> {
        const idbDatabase = await this.getDatabase();
        const idbTransaction = idbDatabase.transaction(table);
        const objectStore = idbTransaction.objectStore(table);

        if (objectStore.keyPath) {
            return objectStore.keyPath as string;
        }
    }


}