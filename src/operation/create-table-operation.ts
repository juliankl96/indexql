import {Operation} from "./operation";
import {ColumnDefinition, CreateTableLikeClause, CreateTableStmt} from "sql-parser-cst/lib/cst/CreateTable";
import {EntityName, Identifier} from "sql-parser-cst/lib/cst/Expr";
import {Constraint, TableConstraint} from "sql-parser-cst";
import {ResultSet} from "./result-set";
import {DatabaseWrapper} from "../database/database-wrapper";


export class CreateTableOperation implements Operation {

    private readonly _statement: CreateTableStmt;
    private readonly _databaseWrapper: DatabaseWrapper;

    //    protected handleUpgrade (objectStoreFn: (IDBDatabase) => void)
    constructor(databaseWrapper: DatabaseWrapper, statement: CreateTableStmt) {
        this._databaseWrapper = databaseWrapper;
        this._statement = statement;
    }

    async execute(): Promise<ResultSet> {
        const entityName: EntityName = this._statement.name

        switch (entityName.type) {
            case "identifier":
                return this.handleIdentifier(entityName as Identifier);
            case "member_expr":
                throw new Error("Not implemented");
            case "bigquery_quoted_member_expr":
                throw new Error("Not implemented");
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

    private async handleIdentifier(identifier: Identifier): Promise<ResultSet> {

        return new Promise(async (resolve, reject) => {

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
            let objectStore = await this._databaseWrapper.createObjectStore(tableName, options);


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
            this._databaseWrapper.commitObjectStore(objectStore).then(() => {
                resolve(ResultSet.empty());
            });

        });


    }
}