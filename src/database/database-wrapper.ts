export class DatabaseWrapper {
    private readonly _databaseName: string;


    constructor(database: string) {
        this._databaseName = database;
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


    public createObjectStore(test: string) {
        this.getDatabase()
    }
}