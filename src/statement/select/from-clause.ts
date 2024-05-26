export interface FromAlias {
    alias?: string;
    table: string;
}

export class FromClause {


    private _aliases: FromAlias[] = [];

    constructor(...from: string[]) {
        for (const query of from) {
            let clause = this.handleFrom(query);
            this._aliases.push(clause);
        }
    }

    public get aliases(): FromAlias[] {
        return this._aliases;
    }

    protected handleFrom(fromQuery: string): FromAlias {
        const fromRegex = /^(\w+)\s*(\w+)?$/gmi;
        let regExpExecArray = fromRegex.exec(fromQuery);
        if (regExpExecArray === null) {
            throw new Error(`Invalid from clause: ${fromQuery}`);
        }
        if (regExpExecArray[1] && regExpExecArray[2]){
            return {
                alias: regExpExecArray[2],
                table: regExpExecArray[1]
            }
        }else{
            return {
                table: regExpExecArray[1]
            }
        }
    }
}