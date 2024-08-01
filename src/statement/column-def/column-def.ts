import {Exp, LiteralValue} from "../model/exp";
import {SignedNumber} from "./signed-number";
import {ForeignKeyClause} from "./foreign-key-clause";

export enum ConflictClause {
    ROLLBACK = 'ROLLBACK',
    ABORT = 'ABORT',
    FAIL = 'FAIL',
    IGNORE = 'IGNORE',
    REPLACE = 'REPLACE'
}


export class ColumnConstraint {
    private readonly _constraintName: string;

    constructor(constraintName?: string) {
        this._constraintName = constraintName;
    }

    public get constraintName(): string {
        return this._constraintName;
    }
}

export class PrimaryKeyConstraint extends ColumnConstraint {
    private readonly _order?: 'ASC' | 'DESC';
    private readonly _conflictClause?: ConflictClause
    private readonly _autoincrement: boolean;

    constructor(constraintName?: string, order?: 'ASC' | 'DESC', conflictClause?: ConflictClause, autoincrement: boolean = false) {
        super(constraintName);
        this._order = order;
        this._conflictClause = conflictClause;
        this._autoincrement = autoincrement;
    }

    public get order(): 'ASC' | 'DESC' | undefined {
        return this._order;
    }

    public get conflictClause(): ConflictClause | undefined {
        return this._conflictClause;
    }

    public get autoincrement(): boolean {
        return this._autoincrement;
    }
}

export class ConflictConstraint extends ColumnConstraint {
    private readonly _conflictClause: ConflictClause;
    private readonly preState: 'NOT NULL' | 'UNIQUE';

    constructor(constraintName?: string, conflictClause?: ConflictClause) {
        super(constraintName);
        this._conflictClause = conflictClause;
    }

    public get conflictClause(): ConflictClause {
        return this._conflictClause;
    }
}

export class CheckConstraint extends ColumnConstraint {
    private readonly _expression: Exp;

    constructor(expression: Exp, constraintName?: string) {
        super(constraintName);
        this._expression = expression;
    }

    public get expression(): Exp {
        return this._expression;
    }
}



export class DefaultConstraint extends ColumnConstraint {
    private readonly _value: Exp | LiteralValue | SignedNumber;

    constructor(expression: Exp, constraintName?: string) {
        super(constraintName);
        this._value = expression;
    }

    public get value(): Exp | LiteralValue | SignedNumber {
        return this._value;
    }

}

export class CollateConstraint extends ColumnConstraint {
    private readonly _collationName: string;

    constructor(collationName: string, constraintName?: string) {
        super(constraintName);
        this._collationName = collationName;
    }

    public get collationName(): string {
        return this._collationName;
    }
}

export class ForeignKeyConstraint extends ColumnConstraint {
    private readonly foreignKeyClause: ForeignKeyClause;
}

export class GeneratedConstraint extends ColumnConstraint {
    private readonly _generatedAlways: boolean;
    private readonly _expression: Exp;
    private readonly _state: 'STORED' | 'VIRTUAL';

    constructor(expression: Exp, constraintName?: string, generatedAlways: boolean = false,  state?: 'STORED' | 'VIRTUAL' ) {
        super(constraintName);
        this._expression = expression;
        this._generatedAlways = generatedAlways;
        this._state = state;
    }

    public get expression(): Exp {
        return this._expression;
    }

    public get generatedAlways(): boolean {
        return this._generatedAlways;
    }

    public get state(): 'STORED' | 'VIRTUAL' {
        return this._state;
    }

}

export class ColumnDef {

    private readonly _columnName: string;
    private readonly _typeName?: string;
    private readonly _constraints: ColumnConstraint[];

    constructor(columnName: string, typeName?: string, constraints: ColumnConstraint[] = []) {
        this._columnName = columnName;
        this._typeName = typeName;
        this._constraints = constraints;
    }
}