import {Operation} from "./operation";
import {ColumnDefinition, CreateTableLikeClause, CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";
import {EntityName, Identifier} from "sql-parser-cst/lib/cst/Expr";
import {Constraint, TableConstraint} from "sql-parser-cst/lib/cst/Constraint";

export class CreateTableOperation implements Operation {

    private readonly _statement: CreateTableStmt;
    private readonly _database: IDBDatabase;

    constructor(database: IDBDatabase, statement: CreateTableStmt, private readonly getWriteDatabase: () => Promise<IDBDatabase>) {
        this._database = database;
        this._statement = statement;
    }

    async execute(): Promise<void> {
        const entityName: EntityName = this._statement.name

        switch (entityName.type) {
            case "identifier":
                return this.handleIdentifier(entityName as Identifier);
        }

    }

    private async handleIdentifier(identifier: Identifier) {
        let database = await this.getWriteDatabase();
        const columns: (ColumnDefinition | TableConstraint | Constraint<TableConstraint> | CreateTableLikeClause)[] = this._statement.columns.expr.items;

        let tableName = identifier.name;
        const objectStore: IDBObjectStore = database.createObjectStore(tableName, {
            keyPath: "id",
            autoIncrement: true
        })

        for (const column of columns) {
            switch (column.type) {
                case "column_definition":
                    let columnDefinition = column as ColumnDefinition;

                    break;
            }

        }


    }
}