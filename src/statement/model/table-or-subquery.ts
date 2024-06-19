import {Exp} from "./exp";
import {SelectStatement} from "../select/select-statement";

export interface TableOrSubquery {

}


export class Table implements TableOrSubquery {
    private _schemaName?: string
    private _tableName: string
    private _alias?: string
    private _indexedByName?: string
    private _notIndexed: boolean;

    constructor(_tableName: string, _schemaName?: string, _alias?: string, _indexedByName?: string, _notIndexed: boolean = false) {
        this._tableName = _tableName
        this._schemaName = _schemaName
        this._alias = _alias
        this._indexedByName = _indexedByName
        this._notIndexed = _notIndexed
    }
}

export class TableFunction implements TableOrSubquery {
    private _functionName: string
    private _expr: Exp[]
    private _useAs: boolean;
    private _tableAlias?: string

    constructor(functionName: string, expr: Exp[], useAs: boolean = false, tableAlias?: string) {
        this._functionName = functionName
        this._expr = expr;
        this._useAs = useAs
        this._tableAlias = tableAlias

    }
}

export class Subquery implements TableOrSubquery {
    private _selectStmt: SelectStatement
    private _useAs: boolean;
    private _tableAlias?: string

    constructor(selectStmt: SelectStatement, useAs: boolean = false, tableAlias?: string) {
        this._selectStmt = selectStmt
        this._useAs = useAs
        this._tableAlias = tableAlias
    }
}

export class TableOrSubqueryArray implements TableOrSubquery{
    private _tableOrSubquery: TableOrSubquery[]

    constructor(tableOrSubqueries: TableOrSubquery[]) {
        this._tableOrSubquery = tableOrSubqueries
    }
}