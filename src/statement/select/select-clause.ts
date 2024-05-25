export interface Selection {
    key: string;
    table?: string;
}

export class SelectClause {

    private _starImport: boolean = false;
    private _selections: Selection[] = [];

    constructor(...selections: string[]) {
        this._starImport = selections.includes('*')
        this._selections = selections
            .filter(value => value!= '*')
            .map(this.handleSelection);

        if (this._starImport && this._selections.length > 0) {
            throw new Error('Invalid selection');
        }
    }

    public get starImport(): boolean {
        return this._starImport;
    }


    handleSelection(selection: string): Selection {
        let dotSplit = selection.split('.');
        if (dotSplit.length === 1) {
            return {
                key: selection
            };
        } else {
            return {
                key: dotSplit[1],
                table: dotSplit[0]
            };
        }
        throw new Error('Invalid selection');
    }

    public findKeys(table: string): string[] {
        return this._selections
            .filter(selection => selection.table === table)
            .map(selection => selection.key);
    }

    public get selections(): Selection[] {
        return this._selections;
    }
}