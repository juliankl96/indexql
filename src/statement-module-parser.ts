export interface StatementModule {
    start: number;
    end: number;

    get value(): string;
}

export class WordModule implements StatementModule {

    get priority(): number {
        return 0;
    }

    get regex(): RegExp {
        return /(\w+|[*;,()'])/gmi;
    }

    constructor(private _value: string, private _start: number,
                private _end: number) {
    }

    public test(regex: RegExp): boolean {
        return regex.test(this.value);
    }

    get value(): string {
        return this._value;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }
}

export class BracketModule implements StatementModule {

    private _modules: StatementModule[];

    constructor(private _start: number, private _end: number, modules: StatementModule[] = [], private _value: string = '') {
        this._modules = modules.map(module => {
            if (module instanceof WordModule) {
                return new WordModule(module.value, module.start + this.start, module.end + this.start);
            }
            if (module instanceof BracketModule) {
                return new BracketModule(module.start + this.start, module.end + this.start, module.getModule());
            }
            throw new Error('Unknown module type');
        });
    }

    get start(): number {
        return this._start;
    }

    get value(): string {
        return this._value;
    }


    public getModule(): StatementModule[] {
        return this._modules;
    }

    get end(): number {
        return this._end;
    }

}


export class StatementModuleParser {

    private wordRegex: RegExp = /(('.*')|(\(.*\))|\w+|[*;,=])/gmi


    public createModule(query: string): StatementModule[] {
        const result: StatementModule[] = [];
        const matches = query.matchAll(this.wordRegex);
        while (true) {
            const match = matches.next();
            if (match.done) {
                break;
            }

            const module = new WordModule(match.value[0], match.value.index, match.value.index + match.value[0].length);
            if (module.value.startsWith('(')) {
                const submodules = this.createModule(module.value.substring(1, module.value.length - 1));
                const bracketModule = new BracketModule(module.start, module.end, submodules, module.value);
                result.push(bracketModule);
            } else {
                result.push(module);
            }

        }
        return result;
    }

}