import {parse, ParserOptions, Statement} from "sql-parser-cst";
import {Operation} from "./operation/operation";
import {CreateOperation} from "./operation/create-operation";
import {CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";

export declare type Callback = (err: Error | null, result: any) => void;

export declare type ConnectionCallback = (err: Error | null) => void;

export class Connection {

    private readonly _databaseName: string;
    private database: IDBDatabase;

    constructor(databaseName: string, private readonly parseOptions: ParserOptions) {
        this._databaseName = databaseName;
    }


    public connect(callback: ConnectionCallback) {
        let idbOpenDBRequest = indexedDB.open(this._databaseName, 1);
        idbOpenDBRequest.onerror = (event) => {
            callback(new Error("Error opening database"));
        }
        idbOpenDBRequest.onsuccess = (event) => {
            this.database = idbOpenDBRequest.result;
            callback(null);
        }
    }

    public query(sql: string, callback: Callback) {
        let ast = parse(sql, this.parseOptions);
        let statements = ast.statements;
        let operation: Operation= null;
        for (const statement of statements) {
            switch (statement['type']) {
                case "create_table_stmt":
                    operation = new CreateOperation(this.database, statement as CreateTableStmt);
                    break;
            }
        }
        operation.execute();
    }
}