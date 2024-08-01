export class TriggerAction {
    private readonly _action: 'ONDELETE' | 'ONUPDATE';
    private readonly _actionType: 'CASCADE' | 'SETNULL' | 'SETDEFAULT' | 'RESTRICT' | 'NOACTION';

    constructor(action: 'ONDELETE' | 'ONUPDATE', actionType: 'CASCADE' | 'SETNULL' | 'SETDEFAULT' | 'RESTRICT' | 'NOACTION') {
        this._action = action;
        this._actionType = actionType;
    }

    get action(): 'ONDELETE' | 'ONUPDATE' {
        return this._action;
    }

    get actionType(): 'CASCADE' | 'SETNULL' | 'SETDEFAULT' | 'RESTRICT' | 'NOACTION' {
        return this._actionType;
    }

}

export class MatchAction {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

}

export class DeferrableClause {
    private readonly _not: boolean;
    private readonly _initially: 'DEFERRED' | 'IMMEDIATE';
}

export class ForeignKeyClause {
    private readonly _foreignTable: string;
    private readonly _columnNames: string[];
    private readonly _actions: (TriggerAction | MatchAction | DeferrableClause)[];

    constructor(foreignTable: string, columnNames: string[] = [], actions: (TriggerAction | MatchAction | DeferrableClause)[] = []) {
        this._foreignTable = foreignTable;
        this._columnNames = columnNames;
        this._actions = actions;
    }

    get foreignTable(): string {
        return this._foreignTable;
    }

    get columnNames(): string[] {
        return this._columnNames;
    }

    get actions(): (TriggerAction | MatchAction | DeferrableClause)[] {
        return this._actions;
    }
}