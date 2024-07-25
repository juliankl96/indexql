import {FunctionCall} from "./exp";
import {SelectStatement} from "../select-statement";

export interface TableOrSubquery {

}

export class TableName implements TableOrSubquery {
    private _schemaName: string
    private _tableName: string;
    private _alias: string;
    private _indexName: string
    private _notIndexSet: boolean;

    constructor(tableName: string, schemaName?: string, alias?: string, indexName?: string, notIndexSet: boolean = false) {
        this._tableName = tableName;
        this._schemaName = schemaName;
        this._alias = alias;
        this._indexName = indexName
        this._notIndexSet = notIndexSet
    }

    public get schemaName() {
        return this._schemaName;
    }

    public get tableName() {
        return this._tableName
    }

    public get alias() {
        return this._alias
    }

    public get indexName() {
        return this._indexName;
    }

    private isNotIndexSet() {
        return this._notIndexSet;
    }
}

export class FunctionQuery extends FunctionCall implements TableOrSubquery {

}

export class SelectQuery implements TableOrSubquery {
    private _selectStatement: SelectStatement;
    private _alias: string;

    constructor(selectStatement: SelectStatement, alias?: string) {
        this._selectStatement = selectStatement;
        this._alias = alias;
    }

    public get selectStatement():SelectStatement{
        return this._selectStatement;
    }

    public get alias(){
        return this._alias;
    }
}