import {parse, ParserOptions} from "sql-parser-cst";
import {Operation} from "./operation/operation";
import {CreateTableOperation} from "./operation/create-table-operation";
import {CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";

export declare type Callback = (err: Error | null, result: any) => void;

export declare type ConnectionCallback = (err: Error | null) => void;

export class Connection {

    private readonly _databaseName: string;
    private _tables: string[] = [];
    private version: number = 1;
    private _database: IDBDatabase;

    constructor(databaseName: string, private readonly parseOptions: ParserOptions) {
        this._databaseName = databaseName;
    }


    public connect(callback: ConnectionCallback) {
        let idbOpenDBRequest = indexedDB.open(this._databaseName);
        idbOpenDBRequest.onerror = (event) => {
            callback(new Error("Error opening database"));
        }
        idbOpenDBRequest.onsuccess = (event) => {
            this._database = event.target['result'];
            this._tables = [];
            for (let i = 0; i < this._database.objectStoreNames.length; i++) {
                this._tables.push(this._database.objectStoreNames.item(i));
            }

            this._database.close();
            this._database = null;
            callback(null);
        }

        idbOpenDBRequest.onupgradeneeded = (event) => {
            this.version = idbOpenDBRequest.result.version + 1
        }
    }

    private getWriteDatabase(): (objectStore: string) => Promise<IDBDatabase> {
        return (objectStore: string) => new Promise((resolve, reject) => {
            if (this._tables.includes(objectStore)) {
                resolve(this._database);
                return;
            }
        });
    }

    public query(sql: string, callback: Callback) {
        if (!this._database) {
            callback(new Error("Database not connected"), null);
            return
        }
        let ast = parse(sql, this.parseOptions);
        let statements = ast.statements;
        for (const statement of statements) {
            let operation: Operation = null;

            switch (statement.type) {
                case "create_table_stmt":
                    operation = new CreateTableOperation(this._database, statement as CreateTableStmt, this.getWriteDatabase());
                    break;
            }
            operation?.execute();
        }

    }
}