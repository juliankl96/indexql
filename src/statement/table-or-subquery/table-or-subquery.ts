import {Exp, FunctionCall} from "../model/exp";
import {SelectStatement} from "../select-statement";
import {JoinClause} from "../join-clause/join-clause";

/**
 * https://www.sqlite.org/syntax/table-or-subquery.html
 */
export interface TableOrSubquery {

}

export class TableName implements TableOrSubquery {
    private readonly _schemaName?: string
    private readonly _tableName: string;
    private readonly _alias: string;
    private readonly _indexName: string
    private readonly _notIndexSet: boolean;

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

export class TableFunctionName implements TableOrSubquery {
    private readonly _functionName: string;
    private readonly _exprList: Exp[];
    private readonly _alias?: string;

    constructor(functionName: string, exprList: Exp[], alias?: string) {
        this._functionName = functionName;
        this._exprList = exprList;
        this._alias = alias;
    }

    public get functionName() {
        return this._functionName;
    }

    public get exprList() {
        return this._exprList;
    }

    public get alias() {
        return this._alias
    }
}

export class SelectQuery implements TableOrSubquery {
    private _selectStatement: SelectStatement;
    private _alias: string;

    constructor(selectStatement: SelectStatement, alias?: string) {
        this._selectStatement = selectStatement;
        this._alias = alias;
    }

    public get selectStatement(): SelectStatement {
        return this._selectStatement;
    }

    public get alias() {
        return this._alias;
    }
}

export class TableOrSubQueryArray implements TableOrSubquery {
    private _tableOrSubqueries: TableOrSubquery[];

    constructor(tableOrSubqueries: TableOrSubquery[]) {
        this._tableOrSubqueries = tableOrSubqueries;
    }

    public get tableOrSubqueries() {
        return this._tableOrSubqueries;
    }

}

export class JoinClauseQuery implements TableOrSubquery {

    private _joinClause: JoinClause;

    constructor(joinClause: JoinClause) {
        this._joinClause = joinClause;
    }

    public get joinClause() {
        return this._joinClause;
    }
}