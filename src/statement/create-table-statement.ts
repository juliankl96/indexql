import {Statement, Type} from "./statement";
import {ColumConstraint} from "./subtypes/column-constraint";

export enum ConflictClause {
    ROLLBACK = 'ROLLBACK',
    ABORT = 'ABORT',
    FAIL = 'FAIL',
    IGNORE = 'IGNORE',
    REPLACE = 'REPLACE'
}


export class ColumnDef {
    columnName: string;
    typeName?: string;
    constraints: ColumConstraint[] = [];
}

export class CreateTableStatement implements Statement {
    type = Type.CREATE_TABLE;
    temp: boolean;
    ifNotExists: boolean;
    tabe: {
        schema: string;
        name: string;
    };
    //TODO: alias is SelectStatement
    alias: any;
    columns: {
        columnName: string;
        typeName: string;
        constraints: {}
    }

}

//////////////////////////// PARSER ////////////////////////////