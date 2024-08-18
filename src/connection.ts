import {parse, ParserOptions} from "sql-parser-cst";
import {Operation} from "./operation/operation";
import {CreateTableOperation} from "./operation/create-table-operation";
import {CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";

export declare type Callback = (err: Error | null, result: any) => void;

export declare type ConnectionCallback = (err: Error | null) => void;

export class Connection {

    private readonly _databaseName: string;

    private version: number = 1;
    private _readDatabase: IDBDatabase;

    constructor(databaseName: string, private readonly parseOptions: ParserOptions) {
        this._databaseName = databaseName;
    }


    public connect(callback: ConnectionCallback) {
        let idbOpenDBRequest = indexedDB.open(this._databaseName);
        idbOpenDBRequest.onerror = (event) => {
            callback(new Error("Error opening database"));
        }
        idbOpenDBRequest.onsuccess = (event) => {
            this._readDatabase = idbOpenDBRequest.result;
            callback(null);
        }

        idbOpenDBRequest.onupgradeneeded = (event) => {
            this.version = idbOpenDBRequest.result.version;
        }
    }

    private getWriteDatabase(): () => Promise<IDBDatabase> {
        return () => {
            let idbOpenDBRequest = indexedDB.open(this._databaseName, this.version++);
            return new Promise((resolve, reject) => {
                idbOpenDBRequest.onerror = (_event) => {
                    reject(new Error("Error opening database"));
                }
                idbOpenDBRequest.onupgradeneeded = (_event) => {
                    resolve(idbOpenDBRequest.result);
                }

                idbOpenDBRequest.onsuccess = (_event) => {
                    resolve(idbOpenDBRequest.result);
                }
            });
        };
    }

    public query(sql: string, callback: Callback) {
        if (!this._readDatabase) {
            callback(new Error("Database not connected"), null);
            return
        }
        let ast = parse(sql, this.parseOptions);
        let statements = ast.statements;
        for (const statement of statements) {
            let operation: Operation = null;

            switch (statement.type) {
                case "create_table_stmt":
                    operation = new CreateTableOperation(this._readDatabase, statement as CreateTableStmt, this.getWriteDatabase());
                    break;
            }
            operation?.execute();
        }

    }
}