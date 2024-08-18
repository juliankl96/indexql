import {Operation} from "./operation";
import {ColumnDefinition, CreateTableLikeClause, CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";
import {EntityName, Identifier} from "sql-parser-cst/lib/cst/Expr";
import {Constraint, TableConstraint} from "sql-parser-cst";


export class CreateTableOperation implements Operation {

    private readonly _statement: CreateTableStmt;
    private readonly _database: IDBDatabase;

    //    protected handleUpgrade (objectStoreFn: (IDBDatabase) => void)
    constructor(database: IDBDatabase, statement: CreateTableStmt, private readonly handleUpgradeFn: (database: (IDBDatabase) => void) => void) {
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

    private evaluatePrimaryKey(columnDefinitions: ColumnDefinition[]) {
        for (const columnDefinition of columnDefinitions) {
            const primary = columnDefinition.constraints.find(value => value.type === "constraint_primary_key");
            if (primary) {
                return columnDefinition;
            }
        }
        return null;
    }

    private async handleIdentifier(identifier: Identifier): Promise<void> {

        return new Promise((resolve, reject) => {


            const items: (ColumnDefinition | TableConstraint | Constraint<TableConstraint> | CreateTableLikeClause)[] = this._statement.columns.expr.items;

            const primaryKey = this.evaluatePrimaryKey(items as ColumnDefinition[]);
            let tableName = identifier.name;
            let options = {};
            if (primaryKey) {
                const autoIncrement = primaryKey.constraints.find(value => value.type === "constraint_auto_increment") !== null;
                options = {
                    keyPath: primaryKey.name.name,
                    autoIncrement: autoIncrement
                };
            }
            this.handleUpgradeFn(database => {
                const objectStore = database.createObjectStore(tableName, options);
                for (const column of items) {

                    if (column === primaryKey) {
                        continue;
                    }

                    switch (column.type) {
                        case "column_definition":

                            const columnDefinition = column as ColumnDefinition;
                            const name = columnDefinition.name.name;
                            objectStore.createIndex(name, name, {unique: false})
                            break;
                    }
                }
                resolve();
            })
        });


    }
}