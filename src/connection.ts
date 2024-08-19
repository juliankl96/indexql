import {parse, ParserOptions} from "sql-parser-cst";
import {Operation} from "./operation/operation";
import {CreateTableOperation} from "./operation/create-table-operation";
import {CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";
import {DatabaseWrapper} from "./database/database-wrapper";

export declare type Callback = (err: Error | null, result: any) => void;

export declare type ConnectionCallback = (err: Error | null) => void;

export class Connection {

    private readonly _databaseName: string;
    private _tables: string[] = [];
    private _databaseWrapper: DatabaseWrapper;
    private _connected: boolean = false;

    constructor(databaseName: string, private readonly parseOptions: ParserOptions) {
        this._databaseName = databaseName;
    }


    public connect(callback: ConnectionCallback) {
        new DatabaseWrapper(this._databaseName).andOpen().then((value) => {
            this._connected = true;
            this._databaseWrapper = value;
            callback(null);
        });
    }


    public query(sql: string, callback: Callback) {
        if (!this._connected) {
            callback(new Error("Database not connected"), null);
            return
        }
        let ast = parse(sql, this.parseOptions);
        let statements = ast.statements;

        for (const statement of statements) {
            let operation: Operation = null;

            switch (statement.type) {
                case "create_table_stmt":
                    operation = new CreateTableOperation(this._databaseWrapper, statement as CreateTableStmt);
                    break;
            }
            operation?.execute().then(value => {
                callback(null, value);
            }).catch(error => {
                callback(error, null);
            })
        }

    }
}