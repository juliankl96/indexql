import {Operation} from "./operation";
import {CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";

export class CreateOperation implements Operation {

    constructor(database: IDBDatabase, private statement: CreateTableStmt) {
    }

    execute(): void {
        console.log("Create operation executed");
    }
}