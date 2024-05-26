export interface ResultColumn {
    key: string;
    table?: string;
}

export const EMPTY_SELECTION_ERROR = 'Empty selection';
export const MIXED_SELECTION_ERROR = 'Mixed selection is not allowed';

/**
 * https://www.sqlite.org/lang_select.html
 */
export class SelectClause {

    private _starImport: boolean = false;

    private _resultColumn: ResultColumn[] = [];
    private _distinct: boolean = false;
    private _all: boolean = false;

    constructor(...selections: string[]) {
        this._starImport = selections.includes('*')
        this._resultColumn = selections
            .filter(value => value != '*')
            .map(this.handleSelection);

        if (this._resultColumn.length === 0 && !this._starImport) {
            throw new Error(EMPTY_SELECTION_ERROR);
        }

        if (this._starImport && this._resultColumn.length > 0) {
            throw new Error(MIXED_SELECTION_ERROR);
        }
    }

    public get starImport(): boolean {
        return this._starImport;
    }


    get distinct(): boolean {
        return this._distinct;
    }

    set distinct(value: boolean) {
        this._distinct = value;
    }

    get all(): boolean {
        return this._all;
    }

    set all(value: boolean) {
        this._all = value;
    }

    handleSelection(selection: string): ResultColumn {
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


    public get resultColumn(): ResultColumn[] {
        return this._resultColumn;
    }
}