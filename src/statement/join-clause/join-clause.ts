import {TableOrSubquery} from "../model/table-or-subquery";

export class JoinClause {
    private _tableOrSubQuery: TableOrSubquery;

    constructor(tableOrSubQuery: TableOrSubquery) {
        this._tableOrSubQuery = tableOrSubQuery;
    }

    public get tableOrSubQuery() {
        return this._tableOrSubQuery;
    }
}


export interface JoinOperator {

}

export class CommaOperator implements JoinOperator {

}

export class EmptyJoin implements JoinOperator {
    public _natural: boolean;

    constructor(natural: boolean) {
        this._natural = natural;
    }

    public get natural(): boolean {
        return this._natural;
    }
}

export class InnerJoinOperator implements JoinOperator {
    private _natural: boolean;

    constructor(natural: boolean) {
        this._natural = natural;
    }

    public get natural(): boolean {
        return this._natural;

    }

}


export class CrossJoinOperator implements JoinOperator {


}

export class LeftJoinOperator implements JoinOperator {
    private _natural: boolean;
    private _outer: boolean;

    constructor(natural: boolean, outer: boolean) {
        this._natural = natural;
        this._outer = outer;
    }

    public get natural(): boolean {
        return this._natural;
    }

    public get outer(): boolean {
        return this._outer;
    }
}

export class RightJoinOperator implements JoinOperator {
    private _natural: boolean;
    private _outer: boolean;

    constructor(natural: boolean, outer: boolean) {
        this._natural = natural;
        this._outer = outer;
    }

    public get natural(): boolean {
        return this._natural
    }

    public get outer(): boolean {
        return this._outer;
    }
}

export class FullJoinOperator implements JoinOperator {
    private _natural: boolean;
    private _outer: boolean;

    constructor(natural: boolean, outer: boolean) {
        this._natural = natural;
        this._outer = outer;
    }

    public get natural(): boolean {
        return this._natural
    }

    public get outer(): boolean {
        return this._outer;
    }
}
